import '@babel/polyfill'
import { of } from 'rxjs'
import { addressesEqual } from './web3-utils'
import { getMultihashFromBytes32 } from './multihash'
import { EMPTY_CALLSCRIPT } from './evmscript-utils'
import AragonApi from '@aragon/api'
import votingAbi from './abi/voting.json'
import tokenAbi from './abi/token.json'

const INITIALIZATION_TRIGGER = Symbol('INITIALIZATION_TRIGGER')

const api = new AragonApi()

const retryEvery = (callback, initialRetryTimer = 1000, increaseFactor = 5) => {
  const attempt = (retryTimer = initialRetryTimer) => {
    // eslint-disable-next-line standard/no-callback-literal
    callback(() => {
      console.error(`Retrying in ${retryTimer / 1000}s...`)

      // Exponentially backoff attempts
      setTimeout(() => attempt(retryTimer * increaseFactor), retryTimer)
    })
  }
  attempt()
}

// Get the token address to initialize ourselves
retryEvery(retry => {
  api.call('voting')
     .subscribe(
        function(result) {
          createStore(result)
        }, err => {
           console.error(
            'Could not start background script execution due to the contract not loading voting:',
            err
           )
           retry()
        })
})

async function createStore(votingAddr) {
  const voting = api.external(votingAddr, votingAbi)

  return api.store(
    async (state, {address, event, returnValues }) => {
      let nextState
      if (state === null) {
        nextState = {
          discussions:[]
        }
      } else {
        nextState = {
          ...state,
        }
      }

      switch (event) {
        case INITIALIZATION_TRIGGER:
          return await initState(voting, votingAddr)
        case 'Comment':
          return await newComment(voting, nextState, returnValues)
        case 'Points':
          return updatePoints(nextState, returnValues)
        case 'StartVote':
          return await listDiscussion(voting, nextState, returnValues)
        case 'CastVote':
          return await castVote(voting, nextState, returnValues)
        default:
          return nextState
      }
    },
    [
      // Always initialize the store with our own home-made event
      of({ event: INITIALIZATION_TRIGGER }),
      // Merge in the token's events into the app's own events for the store
      voting.events(),
    ])
}

async function initState(voting, votingAddr) {
  const tokenAddr = await voting.token().toPromise()
  const token = api.external(tokenAddr, tokenAbi)
  let tokenSymbol, pctBase, supportRequiredPct, supportRequired
  try {
    tokenSymbol = await token.symbol().toPromise()
    pctBase = parseInt(await voting.PCT_BASE().toPromise(), 10)
    supportRequiredPct = parseInt(
      await voting.supportRequiredPct().toPromise(),
      10
    )
    supportRequired = Math.round((supportRequiredPct / pctBase) * 100)
    api.identify(`${tokenSymbol} (${supportRequired}%)`)
  } catch (err) {
    console.error(
      `Failed to load information to identify voting app due to:`,
      err
    )
  }

  let tokenDecimals
  try {
    tokenDecimals = (await token.decimals().toPromise()) || '0'
  } catch (err) {
    console.error(
      `Failed to load token decimals for token at ${tokenAddr} due to:`,
      err
    )
    console.error('Defaulting to 0...')
    tokenDecimals = '0'
  }

  return {
    tokenDecimals: tokenDecimals,
    tokenSymbol: tokenSymbol,
    pctBase: pctBase,
    supportRequirePct: supportRequiredPct,
    supportRequired: supportRequired,
    votingAddress: votingAddr,
  }
}

async function listDiscussion(voting, state, {creator, metadata, voteId}) {
  const { discussions = [] } = state
  const discussionIndex = discussions.findIndex(discussion =>
    discussion.voteID == voteId
  )
  const vote = await loadVoteData(voting, voteId)
  const description = vote.description ? vote.description : null
  if (discussionIndex === -1) {
    discussions.push({
      voteID: voteId,
      vote: vote,
      metadata: metadata,
      description: description,
      creator: creator,
      open: vote.open,
      comments: 0,
    })
  } else {
    discussions[discussionIndex].metadata = metadata
    discussions[discussionIndex].description = description
    discussions[discussionIndex].creator = creator
    discussions[discussionIndex].open = vote.open
    if(!discussions[discussionIndex].comments) discussions[discussionIndex].comments = 0
  }
  return {
    ...state,
    discussions
  }
}

async function castVote(voting, state, { voteId }) {
  const { discussions = [] } = state
  const discussionIndex = discussions.findIndex(discussion =>
    discussion.voteID == voteId
  )
  const vote = await loadVoteData(voting, voteId)
  if (discussionIndex !== -1){
    discussions[discussionIndex].vote = vote
    discussions[discussionIndex].open = vote.open
  }

  return {
    ...state,
    discussions
  }
}

async function newComment(voting, state, returnValues) {
  const { discussions = [], comments = {} } = state
  const { sender, voteID, commentID, parentID } = returnValues
  const ipfs = getMultihashFromBytes32(returnValues)
  let updatedDiscussions = discussions

  if(comments[voteID]){
    if(comments[voteID][parentID]){
      const commentIndex = comments[voteID][parentID].findIndex(comment =>
        comment.commentID == commentID
      )
      if (commentIndex !== -1) {
        comments[voteID][parentID][commentIndex] = {
          sender,
          commentID,
          parentID,
          ipfs
        }
      } else {
        updatedDiscussions = await increaseCommentCount(voting, discussions, voteID)

        comments[voteID][parentID].push({
          sender,
          commentID,
          parentID,
          ipfs
        })
      }
    } else {
      updatedDiscussions = await increaseCommentCount(voting, discussions, voteID)

      comments[voteID][parentID] = []
      comments[voteID][parentID].push({
        sender,
        commentID,
        parentID,
        ipfs
      })
    }
  } else {
    updatedDiscussions = await increaseCommentCount(voting, discussions, voteID)
    comments[voteID] = {}
    comments[voteID][parentID] = []
    comments[voteID][parentID].push({
      sender,
      commentID,
      parentID,
      ipfs
    })
  }
  return {
    ...state,
    comments,
    discussions: updatedDiscussions,
  }
}

function updatePoints(state, {commentID, points}) {
  const { commentPoints = {} } = state
  commentPoints[commentID] = points;
  return {
    ...state,
    commentPoints
  }
}

async function increaseCommentCount(voting, discussions, voteID) {
  const discussionIndex = discussions.findIndex(discussion =>
    discussion.voteID == voteID
  )
  if (discussionIndex === -1) {
    const vote = await loadVoteData(voting, voteID)
    discussions.push({
      voteID,
      vote,
      comments: 1,
    })
  } else {
    if(discussions[discussionIndex].comments){
      discussions[discussionIndex].comments += 1
    } else {
      discussions[discussionIndex].comments = 1
    }
  }

  return discussions
}

async function loadVoteDescription(vote) {
  if (!vote.script || vote.script === EMPTY_CALLSCRIPT) {
    return vote
  }
  try {
    const path = await api.describeScript(vote.script).toPromise()
    vote.description = path
      ? path
          .map(step => {
            const identifier = step.identifier ? ` (${step.identifier})` : ''
            const app = step.name ? `${step.name}${identifier}` : `${step.to}`

            return `${app}: ${step.description || 'No description'}`
          })
          .join('\n')
      : ''
  } catch (error) {
    console.error('Error describing vote script', error)
    vote.description = 'Invalid script. The result cannot be executed.'
  }

  return vote
}

function loadVoteData(votingContract, voteID) {
  return votingContract
    .getVote(voteID)
    .toPromise()
    .then(vote => loadVoteDescription(vote))
}

/// Apply transformations to a vote received from web3
// Note: ignores the 'open' field as we calculate that locally
function marshallVote({
  executed,
  minAcceptQuorum,
  nay,
  snapshotBlock,
  startDate,
  supportRequired,
  votingPower,
  yea,
  script,
}) {
  return {
    executed,
    minAcceptQuorum,
    nay,
    script,
    supportRequired,
    votingPower,
    yea,
    // Like times, blocks should be safe to represent as real numbers
    snapshotBlock: parseInt(snapshotBlock, 10),
    startDate: marshallDate(startDate, 10),
  }
}

function marshallDate(date) {
  // Represent dates as real numbers, as it's very unlikely they'll hit the limit...
  // Adjust for js time (in ms vs s)
  return parseInt(date, 10) * 1000
}

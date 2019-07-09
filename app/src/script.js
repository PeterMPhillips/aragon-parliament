import '@babel/polyfill'
import { of } from 'rxjs'
import { addressesEqual } from './web3-utils'
import { getMultihashFromBytes32 } from './multihash'
import AragonApi from '@aragon/api'
import votingAbi from './abi/voting.json'

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
      console.log('Event: ', event)
      console.log('State:')
      console.log(state)
      console.log('Address: ', address)
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
          return {
            ...nextState,
            votingAddress: votingAddr,
          }
        case 'NewDiscussion':
          return initDiscussion(nextState, returnValues)
        case 'Comment':
          return newComment(nextState, returnValues)
        case 'StartVote':
          return listDiscussion(nextState, returnValues)
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

function listDiscussion(state, {creator, metadata, voteId}) {
  const { discussions = [] } = state
  const discussionIndex = discussions.findIndex(discussion =>
    discussion.voteID == voteId
  )
  console.log('discussion index: ', discussionIndex)
  if (discussionIndex === -1) {
    discussions.push({
      voteID: voteId,
      metadata: metadata,
      creator: creator,
      open: true
    })
  }
  console.log('1')
  return {
    ...state,
    discussions
  }
}

function initDiscussion(state, {voteID}) {
  const { discussions = [] } = state
  const discussionIndex = discussions.findIndex(discussion =>
    discussion.voteID == voteID
  )
  if (discussionIndex !== -1) {
    discussions[discussionIndex].started = true
  }
  return {
    ...state,
    discussions
  }
}

function newComment(state, returnValues) {
  const { comments = {} } = state
  const { sender, voteID, commentID, parentID } = returnValues
  const ipfs = getMultihashFromBytes32(returnValues)

  if(comments[voteID]){
    if(comments[voteID][parentID]){
      const commentIndex = comments[voteID][parentID].findIndex(comment =>
        comment.commentID == commentID
      )
      if (commentIndex === -1) {
        comments[voteID][parentID][commentIndex] = {
          sender,
          commentID,
          parentID,
          ipfs
        }
      }
    } else {
      comments[voteID][parentID] = []
      comments[voteID][parentID].push({
        sender,
        commentID,
        parentID,
        ipfs
      })
    }
  } else {
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
    comments
  }
}

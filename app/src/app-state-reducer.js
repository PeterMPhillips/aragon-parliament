import BN from 'bn.js'

function appStateReducer(state) {
  if (!state) {
    return
  }
  const {
    pctBase,
    tokenDecimals,
    discussions,
  } = state

  const pctBaseNum = parseInt(pctBase, 10)
  const tokenDecimalsNum = parseInt(tokenDecimals, 10)
  const tokenDecimalsBaseNum = Math.pow(10, tokenDecimalsNum)

  return {
    ...state,
    open: discussions
      ? discussions
          .filter(({ open }) => open === true)
          .map(discussion => {
            if(discussion.vote){
              discussion.vote = {
                ...discussion.vote,
                data: {
                  minAcceptQuorum: new BN(discussion.vote.minAcceptQuorum),
                  nay: new BN(discussion.vote.nay),
                  supportRequired: new BN(discussion.vote.supportRequired),
                  votingPower: new BN(discussion.vote.votingPower),
                  yea: new BN(discussion.vote.yea),
                },
                numData: {
                  minAcceptQuorum: parseInt(discussion.vote.minAcceptQuorum, 10) / pctBaseNum,
                  nay: parseInt(discussion.vote.nay, 10) / tokenDecimalsBaseNum,
                  supportRequired: parseInt(discussion.vote.supportRequired, 10) / pctBaseNum,
                  votingPower:
                    parseInt(discussion.vote.votingPower, 10) / tokenDecimalsBaseNum,
                  yea: parseInt(discussion.vote.yea, 10) / tokenDecimalsBaseNum,
                },
              }
            }
            return discussion
          })
      : [],
    closed: discussions
      ? discussions
          .filter(({ open }) => open === false)
          .map(discussion => {
            if(discussion.vote){
              discussion.vote = {
                ...discussion.vote,
                data: {
                  minAcceptQuorum: new BN(discussion.vote.minAcceptQuorum),
                  nay: new BN(discussion.vote.nay),
                  supportRequired: new BN(discussion.vote.supportRequired),
                  votingPower: new BN(discussion.vote.votingPower),
                  yea: new BN(discussion.vote.yea),
                },
                numData: {
                  minAcceptQuorum: parseInt(discussion.vote.minAcceptQuorum, 10) / pctBaseNum,
                  nay: parseInt(discussion.vote.nay, 10) / tokenDecimalsBaseNum,
                  supportRequired: parseInt(discussion.vote.supportRequired, 10) / pctBaseNum,
                  votingPower:
                    parseInt(discussion.vote.votingPower, 10) / tokenDecimalsBaseNum,
                  yea: parseInt(discussion.vote.yea, 10) / tokenDecimalsBaseNum,
                },
              }
            }
            return discussion
          })
      : []
  }
}

export default appStateReducer

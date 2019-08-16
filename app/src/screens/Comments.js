import React from 'react'
import styled from 'styled-components'
import Thread from '../components/Thread'
import VoteText from '../components/VoteText'
import VoteSummary from '../components/VoteSummary'
import { Card, Text, breakpoint, theme } from '@aragon/ui'

class Comments extends React.PureComponent {
  render(){
    const {onReply, onUpvote, onDownvote, connectedAccount, ipfsAPI, network, voteID, vote, tokenSymbol, tokenDecimals, title, comments = {}, points = {}} = this.props
    if(comments[0]){
      comments[0].sort((a,b) => ((points[a.commentID] ? points[a.commentID] : 0) > (points[b.commentID] ? points[b.commentID] : 0)) ? -1 : 1)
    }
    return(
      <Main>
        <CommentsContainer>
          <Info>
            <Part>
              <h2>
                <Label>{title.type}</Label>
              </h2>
              <p>
                <VoteText text={title.value} compact={false}/>
              </p>
            </Part>
            <Part css="border:0;">
              <VoteSummary
                vote={vote}
                tokenSymbol={tokenSymbol}
                tokenDecimals={tokenDecimals}
                ready={true}
              />
            </Part>
          </Info>
          <ThreadContainer>
            {comments[0] && comments[0].map(({ commentID, sender, ipfs }) => (
              <Thread
                key={commentID}
                thisID={commentID}
                thisUser={sender}
                thisIPFS={ipfs}
                comments={comments}
                points={points}
                connectedAccount={connectedAccount}
                ipfsAPI={ipfsAPI}
                onReply={onReply}
                onUpvote={onUpvote}
                onDownvote={onDownvote}
              />
            ))}
            {!comments[0] && (
              <CommentsInfo>No Comments</CommentsInfo>
            )}
          </ThreadContainer>
        </CommentsContainer>
      </Main>
    )
  }
}

const Main = styled.div`
  width: 100%;
`

const CommentsContainer = styled.div`
  padding: 20px 10px;

  ${breakpoint(
    'medium',
    `
      padding: 0;
    `
  )};
`

const Info = styled(Card)`
  height: auto;
  width:100%;
  margin-bottom:20px;
`

const CommentsInfo = styled.p`
  width:100%;
  margin-top: 50px;
  text-align: center;
  font-style: italic;
  color: ${theme.textTertiary};
`

const ThreadContainer = styled.div`
  width:100%;
`

const Label = styled(Text).attrs({
  smallcaps: true,
  color: theme.textSecondary,
})`
  display: block;
  margin-bottom: 10px;
`

const Part = styled.div`
  padding: 15px;
  border-bottom: 1px solid ${theme.contentBorder};
  h2 {
    margin-top: 20px;
    &:first-child {
      margin-top: 0;
    }
  }
`

export default Comments

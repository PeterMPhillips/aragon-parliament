import React from 'react'
import styled from 'styled-components'
import Thread from '../components/Thread'

class Comments extends React.PureComponent {
  render(){
    const {onReply, connectedAccount, ipfsAPI, network, voteID, comments = {}} = this.props
    console.log(comments)
    return(
      <Main>
        <Info>
          <span>Here is some text</span>
        </Info>
        <ThreadContainer>
          {comments[0] && comments[0].map(({ commentID, sender, ipfs }) => (
            <Thread
              key={commentID}
              thisID={commentID}
              thisUser={sender}
              thisIPFS={ipfs}
              comments={comments}
              connectedAccount={connectedAccount}
              ipfsAPI={ipfsAPI}
              onReply={onReply}
            />
          ))}
        </ThreadContainer>
      </Main>
    )
  }
}

const Main = styled.div`
  width: 100%;
`

const Info = styled.div`
  width:100%;
`

const ThreadContainer = styled.div`
  width:100%;
`

export default Comments

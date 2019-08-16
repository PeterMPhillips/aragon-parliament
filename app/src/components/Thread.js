import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import showdown from 'showdown'
import {
  Badge,
  Button,
  Card,
  ContextMenu,
  ContextMenuItem,
  IconAdd,
  IconRemove,
  TableCell,
  TableRow,
  Text,
  breakpoint,
  theme,
} from '@aragon/ui'
import { useNetwork } from '@aragon/api-react'
import LocalIdentityBadge from './LocalIdentityBadge/LocalIdentityBadge'
import { useIdentity } from './IdentityManager/IdentityManager'
import You from './You'

class Thread extends React.PureComponent{
  state = {
    comment: 'Loading...'
  }
  componentDidMount = async () => {
    const { thisIPFS, ipfsAPI } = this.props
    const files = await ipfsAPI.get(thisIPFS)
    const data = JSON.parse(files[0].content.toString('utf8'))
    this.setState({
      comment: data.comment,
    })
  }

  handleReply = () => {
    const { thisID, thisUser, thisIPFS, onReply } = this.props
    const { comment } = this.state
    onReply({
      parentID: thisID,
      parentAuthor: thisUser,
      parentComment: comment,
      parentIPFS: thisIPFS
    })
  }

  handleUpvote = () => {
    const { thisID, onUpvote } = this.props
    onUpvote(thisID);
  }

  handleDownvote = () => {
    const { thisID, onDownvote } = this.props
    onDownvote(thisID);
  }

  render() {
    //const network = useNetwork()
    const { comment } = this.state
    const { onReply, onUpvote, onDownvote, thisID, thisUser, thisIPFS, comments, points, ipfsAPI, network, connectedAccount } = this.props
    const converter = new showdown.Converter()
    const commentHTML = converter.makeHtml(comment)
    
    if(comments[thisID]){
      comments[thisID].sort((a,b) => ((points[a.commentID] ? points[a.commentID] : 0) > (points[b.commentID] ? points[b.commentID] : 0)) ? -1 : 1)
    }
    return (
      <Main>
        <ThreadCard
          commentHTML={commentHTML}
          replies={comments[thisID] ? comments[thisID].length : '0'}
          points={points[thisID] ? points[thisID] : '0'}
          user={thisUser}
          networkType={network.type}
          connectedAccount={connectedAccount}
          handleReply={this.handleReply}
          handleUpvote={this.handleUpvote}
          handleDownvote={this.handleDownvote}
        />
        <ThreadChildren>
          {comments[thisID] && comments[thisID].map(({ commentID, sender, ipfs }) => (
            <Thread
              key={commentID}
              thisID={commentID}
              thisUser={sender}
              thisIPFS={ipfs}
              comments={comments}
              points={points}
              connectedAccount={connectedAccount}
              ipfsAPI={ipfsAPI}
              network={network}
              onReply={onReply}
              onUpvote={onUpvote}
              onDownvote={onDownvote}
            />
          ))}
        </ThreadChildren>
      </Main>
    )
  }

}

const Main = styled.div`

`

const ThreadCard = ({ commentHTML, replies, points, user, networkType, connectedAccount, handleReply, handleUpvote, handleDownvote}) => (
  <Card height="auto" width="100%" css="padding:10px; margin-bottom:5px;">
    <div css="width:calc(100% - 30px); display:inline-block; vertical-align:top">
      <div dangerouslySetInnerHTML={{ __html: commentHTML }} css="margin-bottom:10px;" />
      <div css="width:100%">
        <LocalIdentityBadge
          entity={user}
          networkType={networkType}
          connectedAccount={user === connectedAccount}
        />
        <Button size="mini" mode="secondary" onClick={handleReply} css="margin-left:10px;">
          Reply
        </Button>
        <MessageInfo smallcaps>
          {replies} {replies == 1 ? 'Reply' : 'Replies'}
        </MessageInfo>
        <MessageInfo smallcaps>
          {points} {(points == 1 || points == -1) ? 'Point' : 'Points'}
        </MessageInfo>
      </div>
    </div>
    <VoteButtons>
      <li onClick={handleUpvote}>
        <IconAdd />
      </li>
      <li onClick={handleDownvote}>
        <IconRemove />
      </li>
    </VoteButtons>
  </Card>
)

const ThreadChildren = styled.div`
  padding-left:10px;
  border-left: 1px solid ${theme.contentBorder};

  ${breakpoint(
    'medium',
    `
      padding-left:20px;
    `
  )};
`

const VoteButtons = styled.ul`
  width:30px;
  display:inline-block;
  list-style-type:none;
  text-align:center;
  & > li{
    height:22px;
    color: ${theme.textTertiary};
    cursor: pointer;
  }
  & > li:hover{
    color: ${theme.textSecondary};
  }

`

const MessageInfo = styled(Text)`
  margin-left:15px;
  font-weight: bold;
  color: ${theme.textTertiary};
`

export default props => {
  const network = useNetwork()
  return <Thread comments={PropTypes.object.isRequired} network={network} {...props} />
}

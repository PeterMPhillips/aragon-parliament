import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import {
  Button,
  Card,
  ContextMenu,
  ContextMenuItem,
  IconAdd,
  IconRemove,
  TableCell,
  TableRow,
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
    console.log(data)
    this.setState({
      comment: data.comment,
    })
  }

  handleReply = () => {
    const { thisID, thisIPFS, onReply } = this.props
    const { comment } = this.state
    onReply({
      parentID: thisID,
      parentComment: comment,
      parentIPFS: thisIPFS
    })
  }

  render() {
    //const network = useNetwork()
    const { comment } = this.state
    const { onReply, thisID, thisUser, thisIPFS, comments, ipfsAPI, network, connectedAccount } = this.props
    console.log('user: ', thisUser)
    return (
      <Main>
        <ThreadCard
          comment={comment}
          user={thisUser}
          networkType={network.type}
          connectedAccount={connectedAccount}
          handleReply={this.handleReply}
        />
        <ThreadChildren>
          {comments[thisID] && comments[thisID].map(({ commentID, sender, ipfs }) => (
            <Thread
              key={commentID}
              thisID={commentID}
              thisUser={sender}
              thisIPFS={ipfs}
              comments={comments}
              connectedAccount={connectedAccount}
              ipfsAPI={ipfsAPI}
              network={network}
              onReply={onReply}
            />
          ))}
        </ThreadChildren>
      </Main>
    )
  }

}

const Main = styled.div`

`

const ThreadCard = ({ comment, user, networkType, connectedAccount, handleReply}) => (
  <Card height="auto" width="100%" css="padding:10px; margin-bottom:5px;">
    <div css="margin-bottom:10px;">

      {comment}
    </div>
    <div css="width:100%">
      <LocalIdentityBadge
        entity={user}
        networkType={networkType}
        connectedAccount={user === connectedAccount}
      />
      <Button size="mini" mode="secondary" onClick={handleReply} css="margin-left:10px;">
        Reply
      </Button>
    </div>
  </Card>
)

const ThreadChildren = styled.div`
  margin-left:10px;
  width:calc(100% - 10px);
`

export default props => {
  const network = useNetwork()
  return <Thread comments={PropTypes.object.isRequired} network={network} {...props} />
}

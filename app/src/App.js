import React from 'react'
import PropTypes from 'prop-types'
import { useAragonApi } from '@aragon/api-react'
import {
  AppBar,
  Main,
  AppView,
  Badge,
  BaseStyles,
  Button,
  PublicUrl,
  SidePanel,
  MenuButton,
  font,
  observe,
} from '@aragon/ui'
import styled from 'styled-components'
import { IdentityProvider } from './components/IdentityManager/IdentityManager'
import AppLayout from './components/AppLayout'
import AssignTokensIcon from './components/AssignTokensIcon'
import EmptyState from './screens/EmptyState'
import Discussions from './screens/Discussions'
import Comments from './screens/Comments'
import DiscussionPanelContent from './components/Panels/DiscussionPanelContent'
import CommentPanelContent from './components/Panels/CommentPanelContent'
import loadIPFS from './ipfs'
import { Buffer } from 'ipfs-http-client'
import { getBytes32FromMultiash } from './multihash'

class App extends React.PureComponent {
  static defaultProps = {
    open: [],
    closed: [],
    comments: {},
    commentPoints: {},
    tokenSymbol: '',
    tokenDecimals: 0,
    connectedAccount: '',
    tokenAddress: null,
  }

  state = {
    voteID: null,
    vote: null,
    parentID: 0,
    parentComment: '',
    parentIPFS: '',
    sidepanelOpened: false,
    token: null,
    navigationItems: ['Parliament'],
    ipfs: null,
    ipfsURL: 'https://gateway.ipfs.io/ipfs/'
  }

  componentDidMount = async () => {
    loadIPFS.then((response) => {
      this.setState({
        ipfs: response.ipfs,
        ipfsURL: response.ipfsURL
      })
    })
  }

  getUser = () => {
    return this.props.connectedAccount
  }

  getVoteDescription = (voteID) => {
    const { discussions } = this.props
    const discussionIndex = discussions.findIndex(discussion =>
      discussion.voteID == voteID
    )
    if(discussions[discussionIndex].description){
      return {
        type: 'Description',
        value: discussions[discussionIndex].description,
        creator: discussions[discussionIndex].creator ? discussions[discussionIndex].creator : ''
      }
    } else {
      return {
        type: 'Question',
        value: discussions[discussionIndex].metadata,
        creator: discussions[discussionIndex].creator ? discussions[discussionIndex].creator : ''
      }
    }
  }

  handleInit = (voteID) => {
    const { api } = this.props
    api.newDiscussion(voteID).toPromise()
  }

  handleComment = ({voteID, parentID, comment, parent}) => {
    const { api, connectedAccount } = this.props
    const { ipfs } = this.state
    //Generate json file
    const json = JSON.stringify({
              comment: comment,
              user: connectedAccount,
              parent: parent,
              voteID: voteID
            }, null, 4)
    ipfs.add(Buffer.from(json))
        .then(results => {
          const { digest, hashFunction, size } = getBytes32FromMultiash(results[0].hash)
          api.comment(voteID, parentID, digest, hashFunction, size).toPromise()

          this.handleSidepanelClose()
          this.setState({
            parentID: 0,
            parentAuthor: '',
            parentComment: '',
            parentIPFS: '',
          })
        })
  }

  handleUpvoteComment = (commentID) => {
    const { api } = this.props
    api.upvote(commentID).toPromise();
  }

  handleDownvoteComment = (commentID) => {
    const { api } = this.props
    api.downvote(commentID).toPromise();
  }

  handleUndoCommentVote = (commentID) => {
    const { api } = this.props
    api.undovote(commentID).toPromise();
  }

  handleButton = () => {
    const { voteID } = this.state
    if(voteID){
      this.launchCommentPanelNoParent()
    }
  }

  launchCommentPanelNoParent = () => {
    const { voteID } = this.state
    const description = this.getVoteDescription(voteID)

    this.launchCommentPanel({
      parentID: 0,
      parentAuthor: description.creator,
      parentComment: description.value,
      parentIPFS: '',
    })
  }

  launchCommentPanel = ({parentID, parentAuthor, parentComment, parentIPFS}) => {
    this.setState({
      parentID,
      parentAuthor,
      parentComment,
      parentIPFS,
      sidepanelOpened: true,
    })
  }

  launchDiscussionPanel = () => {
    this.setState({
      sidepanelOpened: true,
    })
  }

  handleView = (voteID, vote) => {
    this.setState({
      voteID: voteID,
      vote: vote,
      navigationItems: ['Parliament', `Vote ${voteID}`]
    })
  }

  handleNavBack = () => {
    this.setState({
      voteID: null,
      vote: null,
      navigationItems: ['Parliament']})
  }

  handleMenuPanelOpen = () => {
    this.props.sendMessageToWrapper('menuPanel', true)
  }

  handleSidepanelOpen = () => {
    this.setState({ sidepanelOpened: true })
  }
  handleSidepanelClose = () => {
    this.setState({ sidepanelOpened: false })
  }
  handleResolveLocalIdentity = address => {
    return this.props.api.resolveAddressIdentity(address).toPromise()
  }
  handleShowLocalIdentityModal = address => {
    return this.props.api
      .requestAddressIdentityModification(address)
      .toPromise()
  }

  render() {
    const {
      open,
      closed,
      connectedAccount,
      comments,
      tokenSymbol,
      tokenDecimals,
      commentPoints,
      requestMenu,
    } = this.props
    const {
      voteID,
      vote,
      parentID,
      parentAuthor,
      parentComment,
      parentIPFS,
      sidepanelOpened,
      navigationItems,
      ipfs,
      ipfsURL,
    } = this.state

    return (
      <Main assetsUrl="./aragon-ui">
        <div css="min-width: 320px">
          <IdentityProvider
            onResolve={this.handleResolveLocalIdentity}
            onShowLocalIdentityModal={this.handleShowLocalIdentityModal}
          >
            <AppLayout
              onMenuOpen={requestMenu}
              navigationItems={navigationItems}
              handleNavBack={this.handleNavBack}
              mainButton={navigationItems.length > 1 && ({
                label: 'Comment',
                icon: <AssignTokensIcon />,
                onClick: this.launchCommentPanelNoParent,
              })}
              smallViewPadding={0}
            >
            {(open.length > 0 || closed.length > 0) ? (
              <div>
                {navigationItems.length <= 1 ? (
                  <Discussions
                    open={open}
                    closed={closed}
                    connectedAccount={connectedAccount}
                    getBalance={this.getBalance}
                    onInitializeDiscussion={this.handleInit}
                    onViewDiscussion={this.handleView}
                  />
                ) : (
                  <Comments
                    voteID={voteID}
                    vote={vote}
                    tokenSymbol={tokenSymbol}
                    tokenDecimals={tokenDecimals}
                    title={this.getVoteDescription(voteID)}
                    comments={comments[voteID]}
                    points={commentPoints}
                    connectedAccount={connectedAccount}
                    ipfsAPI={ipfs}
                    onReply={this.launchCommentPanel}
                    onUpvote={this.handleUpvoteComment}
                    onDownvote={this.handleDownvoteComment}
                  />
                )}
              </div>
            ) : (
              <EmptyState/>
            )}
            </AppLayout>
            <SidePanel
              title={voteID ? (
                `Comment`
              ):(
                `New Discussion`
              )}
              opened={sidepanelOpened}
              onClose={this.handleSidepanelClose}
            >
              {voteID && (
                <CommentPanelContent
                  opened={sidepanelOpened}
                  voteID={voteID}
                  parentID={parentID}
                  parentAuthor={parentAuthor}
                  parentComment={parentComment}
                  parentIPFS={parentIPFS}
                  onSubmit={this.handleComment}
                />
              )}
              {!voteID && (
                <DiscussionPanelContent
                  opened={sidepanelOpened}
                  onSubmit={this.handleInit}
                />
              )}
            </SidePanel>
          </IdentityProvider>
        </div>
      </Main>
    )
  }
}

export default () => {
  const { api, appState, connectedAccount, requestMenu } = useAragonApi()
  return (
    <App
      api={api}
      connectedAccount={connectedAccount}
      requestMenu={requestMenu}
      {...appState}
    />
  )
}

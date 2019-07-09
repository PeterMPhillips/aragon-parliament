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
    comments: [],
    connectedAccount: '',
    tokenAddress: null,
  }

  state = {
    voteID: null,
    metadata: '',
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

  handleInit = (voteID) => {
    const { api } = this.props
    api
      .newDiscussion(voteID)
      .subscribe(
        txHash => {
          console.log('Tx: ', txHash)
        },
        err => {
          console.error(err)
        })
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

    console.log(json)
    //console.log('Uploading to IPFS. Please wait...')
    ipfs.add(Buffer.from(json))
        .then(results => {

          console.log('Hash: ', results[0].hash)
          const { digest, hashFunction, size } = getBytes32FromMultiash(results[0].hash)
          console.log('VoteID: ', voteID)
          console.log('ParentID ', parentID)
          console.log('Digest: ', digest)
          console.log('Hash function: ', hashFunction)
          console.log('Size: ', size)
          this.handleSidepanelClose()
          this.setState({
            parentID: 0,
            parentComment: '',
            parentIPFS: '',
          })
          api.comment(voteID, parentID, digest, hashFunction, size)
             .subscribe(
                txHash => {
                  console.log('Transaction: ', txHash)

                },
                err => {
                  console.error(err)
                })
        })
  }

  handleButton = () => {
    const { voteID } = this.state
    if(voteID){
      this.launchCommentPanelNoParent()
    } else {
      this.launchDiscussionPanel()
    }
  }

  launchCommentPanelNoParent = () => {
    const { metadata } = this.state
    this.launchCommentPanel({
      parentID: 0,
      parentComment: metadata,
      parentIPFS: '',
    })
  }

  launchCommentPanel = ({parentID, parentComment, parentIPFS}) => {
    this.setState({
      parentID,
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

  handleView = (voteID, metadata) => {
    this.setState({
      voteID: voteID,
      metadata: metadata,
      navigationItems: ['Parliament', `Vote ${voteID}`]
    })
  }

  handleNavBack = () => {
    this.setState({
      voteID: null,
      metadata: '',
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
      requestMenu,
    } = this.props
    const {
      voteID,
      parentID,
      parentComment,
      parentIPFS,
      sidepanelOpened,
      navigationItems,
      ipfs,
      ipfsURL,
    } = this.state
    console.log(ipfs)

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
              mainButton={{
                label: navigationItems.length <= 1 ? (
                    `Start Discussion`
                  ):(
                    `Comment`
                  ),
                icon: <AssignTokensIcon />,
                onClick: this.handleSidepanelOpen,
              }}
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
                    comments={comments[voteID]}
                    connectedAccount={connectedAccount}
                    ipfsAPI={ipfs}
                    onReply={this.launchCommentPanel}
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

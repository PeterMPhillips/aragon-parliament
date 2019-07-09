import React from 'react'
import styled from 'styled-components'
import {
  Card,
  Badge,
  SafeLink,
  Button,
} from '@aragon/ui'

class DiscussionCard extends React.Component {
  state = {
    userPic: null,
    socialData: null,
  }
  static defaultProps = {
    voteID: '',
    isTokenHolder: false,
  }
  handleView = () => {
    const { voteID, metadata, onViewDiscussion } = this.props
    onViewDiscussion(voteID, metadata)
  }
  handleInit = () => {
    const { voteID, onInitializeDiscussion } = this.props
    onInitializeDiscussion(voteID)
  }

  render() {
    const {
      voteID,
      started,
    } = this.props

    const isTokenHolder = true
    return (
      <Card width='300px' height='200px' style={{position:'relative'}}>
        <Vote>
          <span>VoteID:</span>
          <span>{voteID}</span>
        </Vote>
        {isTokenHolder && (
          <div>
            {!started && (
              <Button
                size='small'
                mode='secondary'
                onClick={this.handleInit}
              >
                Start Discussion
              </Button>
            )}
            {started && (
              <Button
                size='small'
                mode='secondary'
                onClick={this.handleView}
              >
                View Discussion
              </Button>
            )}
          </div>
        )}
      </Card>
    )
  }
}


const Vote = styled.div`
  max-width:100%;
  display: flex;
  font-size:0.8em;
  align-items: center;
  margin-bottom: 10px;
  & > span:first-child {
    margin-left: 10px;
    margin-right: 10px;
  }
`

export default DiscussionCard

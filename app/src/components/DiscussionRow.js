import React from 'react'
import styled from 'styled-components'
import {
  TableCell,
  TableRow,
  Badge,
  SafeLink,
  Button,
  theme
} from '@aragon/ui'
import VoteText from './VoteText'


class DiscussionRow extends React.Component {
  state = {
    userPic: null,
    socialData: null,
  }
  static defaultProps = {
    voteID: '',
    isTokenHolder: false,
  }
  handleView = () => {
    const { voteID, vote, onViewDiscussion } = this.props
    onViewDiscussion(voteID, vote)
  }
  handleInit = () => {
    const { voteID, onInitializeDiscussion } = this.props
    onInitializeDiscussion(voteID)
  }

  render() {
    const {
      voteID,
      metadata,
      description,
      comments,
    } = this.props

    const isTokenHolder = true
    return (
      <TableRow
        onClick={this.handleView}
        style={{'cursor':'pointer'}}
      >
        <NumberTableCell
          align='left'
        >
          {`# ${voteID}`}
        </NumberTableCell>
        <VoteTableCell>
          <VoteText text={description || metadata} compact={true}/>
        </VoteTableCell>
        <NumberTableCell
          align='right'
        >
          {comments}
        </NumberTableCell>
      </TableRow>
    )
  }
}

const NumberTableCell = styled(TableCell)`
  width: 80px;
  color: ${theme.textTertiary};
`

const VoteTableCell = styled(TableCell)`
  & > div {
    display:inline-block;
  }
`

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

export default DiscussionRow

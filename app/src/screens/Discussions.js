import React from 'react'
import styled from 'styled-components'
import { TabBar, breakpoint } from '@aragon/ui'
import DiscussionCard from '../components/DiscussionCard'

class Discussions extends React.Component {
  state = {
    selected : 0,
    isTokenHolder: false
  }
  static defaultProps = {
    open: [],
    closed: [],
  }
  setSelected = (index) => {
    this.setState({
      selected: index,
    })
  }

  render() {
    const {
      open,
      closed,
      onInitializeDiscussion,
      onViewDiscussion,
    } = this.props

    const {
      selected,
      isTokenHolder
    } = this.state

    const items = []
    if(open.length > 0) items.push('Current Votes')
    if(closed.length > 0) items.push('Past Votes')

    return (
      <Main>
        <TabBar
          items={items}
          selected={selected}
          onSelect={this.setSelected}
        />
        <br/>
        <Grid>
          {items[selected] == 'Current Votes' &&
           open.map(({ voteID, metadata, creator, started }) => (
              <DiscussionCard
                key={voteID}
                voteID={voteID}
                metadata={metadata}
                creator={creator}
                started={started}
                isTokenHolder={isTokenHolder}
                onInitializeDiscussion={onInitializeDiscussion}
                onViewDiscussion={onViewDiscussion}
              />
            ))}
          {items[selected] == 'Past Votes' &&
           closed.map(({ voteID, metadata, creator, started }) => (
              <DiscussionCard
                key={voteID}
                voteID={voteID}
                metadata={metadata}
                creator={creator}
                started={started}
                onInitializeDiscussion={onInitializeDiscussion}
                onViewDiscussion={onViewDiscussion}
              />
            ))}
        </Grid>
      </Main>
    )
  }
}

const Main = styled.div`
  width: 100%;
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 30px;
  ${breakpoint(
    'medium',
    `
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
     `
  )};
`

export default Discussions

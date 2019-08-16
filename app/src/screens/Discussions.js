import React from 'react'
import styled from 'styled-components'
import {
  TabBar,
  Table,
  TableHeader,
  TableRow,
  Viewport,
  breakpoint } from '@aragon/ui'
import DiscussionRow from '../components/DiscussionRow'

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
      <Viewport>
        {({ below }) => {
          const compactTable = below('medium')
          return (
            <Main>
              <TabBar
                items={items}
                selected={selected}
                onSelect={this.setSelected}
              />
              <br/>
              <ResponsiveTable
                header={
                  <TableRow>
                    <TableHeader
                      title='Vote ID'
                    />
                    <TableHeader
                      title="Question"
                    />
                    <TableHeader
                      title="Comments"
                      align='right'
                    />
                  </TableRow>
                }
                noSideBorders={compactTable}
              >
                {items[selected] == 'Current Votes' &&
                 open.map(({ voteID, vote, metadata, description, comments, creator }) => (
                    <DiscussionRow
                      key={voteID}
                      voteID={voteID}
                      vote={vote}
                      metadata={metadata}
                      description={description}
                      comments={comments}
                      creator={creator}
                      isTokenHolder={isTokenHolder}
                      onInitializeDiscussion={onInitializeDiscussion}
                      onViewDiscussion={onViewDiscussion}
                    />
                  ))}
                {items[selected] == 'Past Votes' &&
                 closed.map(({ voteID, vote, metadata, description, comments, creator }) => (
                    <DiscussionRow
                      key={voteID}
                      voteID={voteID}
                      vote={vote}
                      metadata={metadata}
                      description={description}
                      comments={comments}
                      creator={creator}
                      onInitializeDiscussion={onInitializeDiscussion}
                      onViewDiscussion={onViewDiscussion}
                    />
                  ))}
              </ResponsiveTable>
            </Main>
          )
        }}
      </Viewport>
    )
  }
}

const Main = styled.div`
  width: 100%;
`

const ResponsiveTable = styled(Table)`
  margin-top: 16px;

  ${breakpoint(
    'medium',
    `
      opacity: 1;
      margin-top: 0;
    `
  )};
`

export default Discussions

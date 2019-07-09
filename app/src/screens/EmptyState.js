import React from 'react'
import styled from 'styled-components'
import { EmptyStateCard } from '@aragon/ui'
import emptyIcon from '../assets/empty-card-icon.svg'

const EmptyState = () => (
  <Main>
    <EmptyStateCard
      title="There are no open conversations"
      text="You must start a vote before you can begin chatting."
      icon={<img src={emptyIcon} alt="" />}
    />
  </Main>
)

const Main = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
`

export default EmptyState

import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { AppBar, AppView, Button, ButtonIcon, NavigationBar, Viewport, font } from '@aragon/ui'
import { useAragonApi } from '@aragon/api-react'
import MenuButton from './MenuButton/MenuButton'

const AppLayout = ({
  children,
  smallViewPadding,
  largeViewPadding,
  mainButton,
  navigationItems,
  handleNavBack,
}) => {
  const { requestMenu, displayMenuButton } = useAragonApi()
  return (
    <Viewport>
      {({ below }) => (
        <AppView
          padding={below('medium') ? smallViewPadding : largeViewPadding}
          appBar={
            <AppBar>
              {displayMenuButton && <MenuButton onClick={requestMenu} />}
              <AppBarContainer
                style={{ padding: below('medium') ? '0' : '0 30px 0 10px'}}
              >

                <NavigationBar
                  items={navigationItems}
                  onBack={handleNavBack}
                  compact={displayMenuButton ? true : false}
                />
                {mainButton &&
                  (below('medium') ? (
                    <ButtonIcon
                      onClick={mainButton.onClick}
                      label={mainButton.label}
                      css={`
                        width: auto;
                        height: 100%;
                        padding: 0 20px 0 10px;
                        margin-left: 8px;
                      `}
                    >
                      {mainButton.icon}
                    </ButtonIcon>
                  ) : (
                    <Button mode="strong" onClick={mainButton.onClick}>
                      {mainButton.label}
                    </Button>
                  ))}
              </AppBarContainer>
            </AppBar>
          }
        >
          {children}
        </AppView>
      )}
    </Viewport>
  )
}

AppLayout.defaultProps = {
  smallViewPadding: 20,
  largeViewPadding: 30,
}

AppLayout.propTypes = {
  children: PropTypes.node,
  smallViewPadding: PropTypes.number,
  largeViewPadding: PropTypes.number,
  mainButton: PropTypes.shape({
    icon: PropTypes.node.isRequired,
    label: PropTypes.node.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
}

const AppBarContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
`

export default AppLayout

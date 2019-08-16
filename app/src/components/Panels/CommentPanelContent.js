import 'babel-polyfill'
import React from 'react'
import styled from 'styled-components'
import showdown from 'showdown'
import { Button, Field, IconError, SidePanelSeparator, Text, TextInput, Info, theme } from '@aragon/ui'
import LocalIdentityBadge from '../LocalIdentityBadge/LocalIdentityBadge'
//import CircularProgress from '@material-ui/core/CircularProgress'

const initialState = {
  messageField: '',
  error: null,
  warning: null,
}

class CommentPanelContent extends React.Component {
  state = {
    ...initialState,
  }
  componentWillReceiveProps = async ({ opened }) => {
    if(opened && !this.props.opened) {
      // setTimeout is needed as a small hack to wait until the input is
      // on-screen before we call focus
      this.messageInput && setTimeout(() => this.messageInput.focus(), 0)
    }

    // Finished closing the panel, its state can be reset
    if(!opened && this.props.opened) {
      this.setState({
        ...initialState
      })
    }
  }

  handleMessageChange = event => {
    this.setState({
      messageField: event.target.value,
    })
  }

  handleSubmit = event => {
    event.preventDefault()
    const { messageField } = this.state
    const { voteID, parentID, parentIPFS, onSubmit } = this.props
    this.setState({
      messageField: ''
    })
    onSubmit({
      voteID,
      parentID,
      parent: parentIPFS,
      comment: messageField
    })

  }

  render() {
    const { parentAuthor, parentComment } = this.props
    const {
      messageField,
      error,
      warning,
      messages,
    } = this.state

    const converter = new showdown.Converter()
    const commentHTML = converter.makeHtml(parentComment)

    return (
      <div>
        {(parentAuthor && parentAuthor != '') && (
          <div>
            <Part>
              <h2>
                <Label>Responding To</Label>
              </h2>
              <div
                css={`
                  display: flex;
                  align-items: center;
                `}
              >
                <LocalIdentityBadge entity={parentAuthor} shorten={false}/>
              </div>
            </Part>
            <SidePanelSeparator />
            <Part>
              <h2>
                <Label>Message</Label>
              </h2>
              <div dangerouslySetInnerHTML={{ __html: commentHTML }}/>
            </Part>
            <SidePanelSeparator />
          </div>
        )}
        <Part>
          <form onSubmit={this.handleSubmit}>
            <Field
              label='Response'
            >
              <TextArea
                ref={element => (this.messageInput = element)}
                value={messageField}
                onChange={this.handleMessageChange}
                wide
              />
            </Field>
            <Button
              mode="strong"
              type="submit"
              wide
            >
              Submit
            </Button>
          </form>
        </Part>
      </div>
    )
  }
}

const Label = styled(Text).attrs({
  smallcaps: true,
  color: theme.textSecondary,
})`
  display: block;
  margin-bottom: 10px;
`

const Part = styled.div`
  padding: 20px 0;
  h2 {
    margin-top: 20px;
    &:first-child {
      margin-top: 0;
    }
  }
`

const TextArea = styled.textarea`
  width:100%;
  max-width:100%;
  min-width:100%;
  height:100px;
  min-height:33px;
  padding:5px 10px;
  border: 1px solid rgba(209, 209, 209, 0.5);
  border-radius: 3px;
  &:focus {
    outline: none;
    border-color: ${theme.contentBorderActive};
  }
`

const WarningMessage = ({ message }) => <Info.Action>{message}</Info.Action>

const ErrorMessage = ({ message }) => (
  <Info background="rgba(251,121,121,0.06)"><IconError />
    <Text size="small" style={{ marginLeft: '10px' }}>
      {message}
    </Text>
  </Info>
)
/*
const Spinner = () => (
  <div style={{ width: '100%', textAlign: 'center' }}>
    <CircularProgress style={{ color: theme.accent }}/>
  </div>
)
*/

export default CommentPanelContent

import 'babel-polyfill'
import React from 'react'
import styled from 'styled-components'
import { Button, Field, IconError, Text, TextInput, Info, theme } from '@aragon/ui'
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
    const { parentComment } = this.props
    const {
      messageField,
      error,
      warning,
      messages,
    } = this.state

    return (
      <div>
        <div>
          {parentComment}
        </div>
        <form onSubmit={this.handleSubmit}>
          <Field
            label='Message'
          >
            <TextInput
              innerRef={element => (this.messageInput = element)}
              value={messageField}
              onChange={this.handleMessageChange}
            />
          </Field>
          <Button
            mode="strong"
            type="submit"
          >
            Submit
          </Button>
        </form>
      </div>
    )
  }
}

const Messages = styled.div`
  margin-top: 15px;
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

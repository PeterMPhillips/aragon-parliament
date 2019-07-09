function appStateReducer(state) {
  if (!state) {
    return
  }
  console.log(state)
  const { discussions } = state
  return {
    ...state,
    open: discussions
      ? discussions
          .filter(({ open }) => open === true)
      : [],
    closed: discussions
      ? discussions
          .filter(({ open }) => open === false)
      : []
  }
}

export default appStateReducer

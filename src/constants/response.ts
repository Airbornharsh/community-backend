export const catchErrorResponse = {
  status: false,
  errors: [
    {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }
  ]
}

export const NoUserResponse = {
  status: false,
  errors: [
    {
      message: 'You need to sign in to proceed.',
      code: 'NOT_SIGNEDIN'
    }
  ]
}

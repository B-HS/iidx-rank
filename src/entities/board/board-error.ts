export const getBoardErrorKey = (code: string) => {
    if (code === 'RATE_LIMITED') return 'board.errorRateLimited'
    if (code === 'FORBIDDEN') return 'board.errorForbidden'
    if (code === 'VALIDATION_ERROR' || code === 'INVALID_CONTENT') return 'board.errorInvalidInput'
    return null
}

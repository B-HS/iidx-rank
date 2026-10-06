export const BOARD_PATHNAME = '/board'
const FIRST_PAGE = 1

/**
 * Returns the canonical pathname of a board list page. The first page has no query string.
 * @param page - validated page number starting at 1
 */
export const getBoardListPathname = (page: number) => (page > FIRST_PAGE ? `${BOARD_PATHNAME}?page=${page}` : BOARD_PATHNAME)

export const getBoardPostPathname = (postId: string) => `${BOARD_PATHNAME}/${postId}`

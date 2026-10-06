import { BOARD_COMMENTS_PAGE_PARAM } from '@entities/board/board.dto'

const FIRST_PAGE = 1

/**
 * Builds the query string that points at a comment page while keeping every other parameter. The first page is the default and is left out.
 * @param search - current query string, with or without the leading `?`
 * @param page - comment page to point at
 * @returns query string without the leading `?`, empty when no parameter remains
 */
export const getCommentsPageQuery = (search: string, page: number) => {
    const otherParams = [...new URLSearchParams(search)].filter(([name]) => name !== BOARD_COMMENTS_PAGE_PARAM)
    const pageParams = page > FIRST_PAGE ? [[BOARD_COMMENTS_PAGE_PARAM, String(page)]] : []

    return new URLSearchParams([...otherParams, ...pageParams]).toString()
}

import { BOARD_COMMENT_EXCERPT_MAX_LENGTH } from '@entities/board/board.dto'

const WHITESPACE_RUN_PATTERN = /\s+/g

/**
 * Collapses whitespace in a comment body and truncates it to the excerpt length, counted in code points.
 * @param content - stored comment body
 */
export const getCommentExcerpt = (content: string) =>
    Array.from(content.replace(WHITESPACE_RUN_PATTERN, ' ').trim()).slice(0, BOARD_COMMENT_EXCERPT_MAX_LENGTH).join('').trimEnd()

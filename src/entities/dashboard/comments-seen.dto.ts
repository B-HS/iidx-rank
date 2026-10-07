import { z } from 'zod'
import { BoardIdSchema, type MyPostComment } from '@entities/board/board.dto'
import { DASHBOARD_COMMENTS_SEEN_MAX_IDS } from '@shared/constants/dashboard'

type SeenComment = Pick<MyPostComment, 'id' | 'createdAt'>

export const CommentsSeenSchema = z.object({
    seenAt: z.iso.datetime().nullable(),
    seenCommentIds: z.array(BoardIdSchema).max(DASHBOARD_COMMENTS_SEEN_MAX_IDS),
})
export type CommentsSeen = z.infer<typeof CommentsSeenSchema>

const EMPTY_COMMENTS_SEEN: CommentsSeen = { seenAt: null, seenCommentIds: [] }

/**
 * Parses the stored seen state of the comments on the viewer's posts. Missing, malformed or outdated values fall back to the empty state.
 * @param value - raw string read from browser storage
 */
export const parseCommentsSeen = (value: string | null) => {
    if (!value) return EMPTY_COMMENTS_SEEN

    try {
        const stored: unknown = JSON.parse(value)
        const parsed = CommentsSeenSchema.safeParse(stored)

        return parsed.success ? parsed.data : EMPTY_COMMENTS_SEEN
    } catch {
        return EMPTY_COMMENTS_SEEN
    }
}

/**
 * Tells whether a comment is newer than the last confirmation and was not confirmed individually.
 * @param seen - stored seen state
 * @param comment - comment on one of the viewer's posts
 */
export const isCommentUnseen = (seen: CommentsSeen, comment: SeenComment) =>
    !seen.seenCommentIds.includes(comment.id) && (seen.seenAt === null || Date.parse(comment.createdAt) > Date.parse(seen.seenAt))

/**
 * Confirms the given comments individually and keeps the last confirmation time. The newest ids are kept when the list exceeds its limit.
 * @param seen - stored seen state
 * @param comments - comments the viewer is about to read
 */
export const markCommentsSeen = (seen: CommentsSeen, comments: readonly SeenComment[]) => ({
    seenAt: seen.seenAt,
    seenCommentIds: [...new Set([...comments.map((comment) => comment.id), ...seen.seenCommentIds])].slice(0, DASHBOARD_COMMENTS_SEEN_MAX_IDS),
})

/**
 * Moves the last confirmation time to the newest listed comment so that every listed comment counts as seen.
 * @param seen - stored seen state
 * @param comments - comments currently listed
 */
export const markAllCommentsSeen = (seen: CommentsSeen, comments: readonly SeenComment[]) => {
    const timestamps = [
        ...comments.map((comment) => Date.parse(comment.createdAt)),
        ...(seen.seenAt === null ? [] : [Date.parse(seen.seenAt)]),
    ].filter((timestamp) => !Number.isNaN(timestamp))

    return { seenAt: timestamps.length === 0 ? null : new Date(Math.max(...timestamps)).toISOString(), seenCommentIds: [] }
}

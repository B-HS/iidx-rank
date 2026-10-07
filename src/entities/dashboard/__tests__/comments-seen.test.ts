import { describe, expect, test } from 'bun:test'
import { isCommentUnseen, markAllCommentsSeen, markCommentsSeen, parseCommentsSeen } from '@entities/dashboard/comments-seen.dto'
import { DASHBOARD_COMMENTS_SEEN_MAX_IDS } from '@shared/constants/dashboard'

const OLD_COMMENT = { id: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-01T00:00:00.000Z' }
const NEW_COMMENT = { id: '22222222-2222-4222-8222-222222222222', createdAt: '2026-10-05T00:00:00.000Z' }
const EMPTY_SEEN = parseCommentsSeen(null)

describe('parseCommentsSeen', () => {
    test('값이 없거나 형식이 맞지 않으면 빈 상태를 돌려준다', () => {
        expect(parseCommentsSeen(null)).toEqual({ seenAt: null, seenCommentIds: [] })
        expect(parseCommentsSeen('{')).toEqual({ seenAt: null, seenCommentIds: [] })
        expect(parseCommentsSeen(JSON.stringify({ seenAt: 'yesterday', seenCommentIds: [] }))).toEqual({ seenAt: null, seenCommentIds: [] })
    })

    test('저장한 상태를 그대로 읽는다', () => {
        const seen = { seenAt: OLD_COMMENT.createdAt, seenCommentIds: [NEW_COMMENT.id] }

        expect(parseCommentsSeen(JSON.stringify(seen))).toEqual(seen)
    })
})

describe('isCommentUnseen', () => {
    test('확인한 적이 없으면 모든 댓글이 새 댓글이다', () => {
        expect(isCommentUnseen(EMPTY_SEEN, OLD_COMMENT)).toBe(true)
    })

    test('마지막 확인 시각 이후의 댓글만 새 댓글이다', () => {
        const seen = { seenAt: '2026-10-03T00:00:00.000Z', seenCommentIds: [] }

        expect(isCommentUnseen(seen, OLD_COMMENT)).toBe(false)
        expect(isCommentUnseen(seen, NEW_COMMENT)).toBe(true)
    })

    test('개별로 확인한 댓글은 새 댓글이 아니다', () => {
        expect(isCommentUnseen(markCommentsSeen(EMPTY_SEEN, [NEW_COMMENT]), NEW_COMMENT)).toBe(false)
        expect(isCommentUnseen(markCommentsSeen(EMPTY_SEEN, [NEW_COMMENT]), OLD_COMMENT)).toBe(true)
    })
})

describe('markCommentsSeen', () => {
    test('중복 없이 추가하고 최대 개수를 넘기지 않는다', () => {
        const comments = Array.from({ length: DASHBOARD_COMMENTS_SEEN_MAX_IDS + 1 }, (_, index) => ({
            id: `33333333-3333-4333-8333-${String(index).padStart(12, '0')}`,
            createdAt: NEW_COMMENT.createdAt,
        }))
        const seen = markCommentsSeen(markCommentsSeen(EMPTY_SEEN, [NEW_COMMENT]), [NEW_COMMENT, ...comments])

        expect(seen.seenCommentIds).toHaveLength(DASHBOARD_COMMENTS_SEEN_MAX_IDS)
        expect(seen.seenCommentIds[0]).toBe(NEW_COMMENT.id)
        expect(seen.seenAt).toBeNull()
    })
})

describe('markAllCommentsSeen', () => {
    test('목록의 가장 최근 댓글 시각으로 옮기고 개별 확인을 비운다', () => {
        const seen = markAllCommentsSeen(markCommentsSeen(EMPTY_SEEN, [OLD_COMMENT]), [OLD_COMMENT, NEW_COMMENT])

        expect(seen).toEqual({ seenAt: NEW_COMMENT.createdAt, seenCommentIds: [] })
        expect(isCommentUnseen(seen, NEW_COMMENT)).toBe(false)
    })

    test('이미 더 늦은 확인 시각이 있으면 유지한다', () => {
        const later = '2026-10-06T00:00:00.000Z'

        expect(markAllCommentsSeen({ seenAt: later, seenCommentIds: [] }, [NEW_COMMENT]).seenAt).toBe(later)
    })

    test('댓글이 없으면 확인 시각을 만들지 않는다', () => {
        expect(markAllCommentsSeen(EMPTY_SEEN, [])).toEqual({ seenAt: null, seenCommentIds: [] })
    })
})

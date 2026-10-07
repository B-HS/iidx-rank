import { describe, expect, test } from 'bun:test'
import { BOARD_COMMENT_EXCERPT_MAX_LENGTH } from '@entities/board/board.dto'
import { getCommentExcerpt } from '@entities/board/comment-excerpt'

describe('getCommentExcerpt', () => {
    test('연속된 공백과 줄바꿈을 한 칸으로 줄이고 앞뒤 공백을 지운다', () => {
        expect(getCommentExcerpt('  첫 줄\n\n둘째\t\t줄   끝  ')).toBe('첫 줄 둘째 줄 끝')
    })

    test('길이 한도 이하의 본문은 그대로 돌려준다', () => {
        const content = '가'.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH)

        expect(getCommentExcerpt(content)).toBe(content)
    })

    test('길이 한도를 넘으면 한도까지만 남긴다', () => {
        expect(getCommentExcerpt('가'.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH + 1))).toBe('가'.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH))
    })

    test('잘린 자리의 끝 공백을 남기지 않는다', () => {
        const head = '가'.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH - 1)

        expect(getCommentExcerpt(`${head} 나`)).toBe(head)
    })

    test('서로게이트 쌍 문자를 중간에서 자르지 않는다', () => {
        const emoji = String.fromCodePoint(0x1f3b5)
        const excerpt = getCommentExcerpt(emoji.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH + 1))

        expect(excerpt).toBe(emoji.repeat(BOARD_COMMENT_EXCERPT_MAX_LENGTH))
        expect(Array.from(excerpt)).toHaveLength(BOARD_COMMENT_EXCERPT_MAX_LENGTH)
    })

    test('공백뿐인 본문은 빈 문자열이 된다', () => {
        expect(getCommentExcerpt(' \n\t ')).toBe('')
    })
})

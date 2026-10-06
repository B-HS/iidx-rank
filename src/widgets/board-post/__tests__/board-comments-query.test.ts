import { describe, expect, test } from 'bun:test'
import { getCommentsPageQuery } from '@widgets/board-post/board-comments-query'

describe('getCommentsPageQuery', () => {
    test('2페이지 이상이면 댓글 페이지 값을 넣는다', () => {
        expect(getCommentsPageQuery('', 2)).toBe('comments=2')
        expect(getCommentsPageQuery('?comments=2', 5)).toBe('comments=5')
    })

    test('1페이지는 값을 생략한다', () => {
        expect(getCommentsPageQuery('?comments=3', 1)).toBe('')
        expect(getCommentsPageQuery('', 1)).toBe('')
    })

    test('다른 값은 그대로 둔다', () => {
        expect(getCommentsPageQuery('?ref=home&comments=3', 4)).toBe('ref=home&comments=4')
        expect(getCommentsPageQuery('ref=home&comments=3', 1)).toBe('ref=home')
    })

    test('중복된 댓글 페이지 값은 하나로 합친다', () => {
        expect(getCommentsPageQuery('?comments=2&comments=9', 3)).toBe('comments=3')
    })
})

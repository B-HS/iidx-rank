import { describe, expect, test } from 'bun:test'
import { BoardCommentsPageSchema } from '@entities/board/board.dto'

describe('BoardCommentsPageSchema', () => {
    test('양의 정수 문자열을 페이지 번호로 읽는다', () => {
        expect(BoardCommentsPageSchema.parse('3')).toBe(3)
        expect(BoardCommentsPageSchema.parse(2)).toBe(2)
    })

    test('값이 없으면 1페이지로 처리한다', () => {
        expect(BoardCommentsPageSchema.parse(undefined)).toBe(1)
        expect(BoardCommentsPageSchema.parse(null)).toBe(1)
        expect(BoardCommentsPageSchema.parse('')).toBe(1)
    })

    test('잘못된 값은 1페이지로 처리한다', () => {
        expect(BoardCommentsPageSchema.parse('abc')).toBe(1)
        expect(BoardCommentsPageSchema.parse('0')).toBe(1)
        expect(BoardCommentsPageSchema.parse('-2')).toBe(1)
        expect(BoardCommentsPageSchema.parse('2.5')).toBe(1)
        expect(BoardCommentsPageSchema.parse('1e400')).toBe(1)
    })
})

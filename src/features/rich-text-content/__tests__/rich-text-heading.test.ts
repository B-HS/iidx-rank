import { describe, expect, test } from 'bun:test'
import { RICH_TEXT_HEADING_LEVELS } from '@entities/board/rich-text.extensions'
import { getRichTextHeadingTag } from '@features/rich-text-content/rich-text-heading'

const POST_TITLE_HEADING_RANK = 2

describe('getRichTextHeadingTag', () => {
    test('큰 제목과 작은 제목을 글 제목보다 낮은 태그로 바꾼다', () => {
        expect(getRichTextHeadingTag(2)).toBe('h3')
        expect(getRichTextHeadingTag(3)).toBe('h4')
    })

    test('허용된 모든 단계가 글 제목보다 아래 단계가 된다', () => {
        const ranks = RICH_TEXT_HEADING_LEVELS.map((level) => Number(getRichTextHeadingTag(level).slice(1)))

        expect(ranks.every((rank) => rank > POST_TITLE_HEADING_RANK)).toBe(true)
        expect(ranks).toEqual(ranks.toSorted((left, right) => left - right))
    })

    test('허용되지 않은 단계는 첫 단계의 태그로 처리한다', () => {
        expect(getRichTextHeadingTag(1)).toBe('h3')
        expect(getRichTextHeadingTag('2')).toBe('h3')
        expect(getRichTextHeadingTag(undefined)).toBe('h3')
    })
})

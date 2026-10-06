import { describe, expect, test } from 'bun:test'
import { getRichTextImageSources, isRichTextEmpty } from '@features/rich-text-editor/rich-text-document'

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const image = (src: unknown) => ({ type: 'image', attrs: { src, alt: null } })
const documentOf = (...content: unknown[]) => ({ type: 'doc', content })

describe('본문 비어 있음 판정', () => {
    test('글자도 이미지도 없으면 비어 있다고 판정합니다', () => {
        expect(isRichTextEmpty(documentOf())).toBe(true)
        expect(isRichTextEmpty(documentOf({ type: 'paragraph' }))).toBe(true)
        expect(isRichTextEmpty(documentOf(paragraph('   '), paragraph('\n\t')))).toBe(true)
        expect(isRichTextEmpty(documentOf({ type: 'paragraph', content: [{ type: 'hardBreak' }] }, { type: 'horizontalRule' }))).toBe(true)
    })

    test('글자가 있으면 비어 있지 않다고 판정합니다', () => {
        expect(isRichTextEmpty(documentOf(paragraph('본문')))).toBe(false)
        expect(isRichTextEmpty(documentOf({ type: 'bulletList', content: [{ type: 'listItem', content: [paragraph(' a ')] }] }))).toBe(false)
    })

    test('이미지만 있어도 비어 있지 않다고 판정합니다', () => {
        expect(isRichTextEmpty(documentOf(image('/api/files/board/a.png')))).toBe(false)
    })

    test('객체가 아닌 값은 비어 있다고 판정합니다', () => {
        for (const value of [null, undefined, '본문', 1, []]) expect(isRichTextEmpty(value)).toBe(true)
    })
})

describe('본문 이미지 주소 목록', () => {
    test('중첩된 위치의 이미지까지 문서 순서대로 모읍니다', () => {
        const document = documentOf(image('/api/files/board/a.png'), paragraph('글'), {
            type: 'blockquote',
            content: [image('https://example.com/b.png')],
        })

        expect(getRichTextImageSources(document)).toEqual(['/api/files/board/a.png', 'https://example.com/b.png'])
    })

    test('주소가 문자열이 아닌 이미지는 빈 문자열로 셉니다', () => {
        expect(getRichTextImageSources(documentOf(image(null), { type: 'image' }))).toEqual(['', ''])
    })

    test('이미지가 없으면 빈 목록을 반환합니다', () => {
        expect(getRichTextImageSources(documentOf(paragraph('글')))).toEqual([])
    })
})

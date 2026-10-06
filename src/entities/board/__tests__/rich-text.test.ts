import { describe, expect, test } from 'bun:test'
import { RICH_TEXT_MAX_BYTES, RICH_TEXT_MAX_IMAGES } from '@entities/board/board.dto'
import { getRichTextPlainText, parseRichTextDocument } from '@entities/board/rich-text'
import { RICH_TEXT_LINK_HTML_ATTRIBUTES } from '@entities/board/rich-text.extensions'

const BOARD_IMAGE_SOURCE = '/api/files/board/3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b.png'
const AVATAR_IMAGE_SOURCE = '/api/files/avatar/3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b.png'
const NESTING_BEYOND_LIMIT = 5000

const text = (value: string, marks?: unknown[]) => ({ type: 'text', text: value, ...(marks && { marks }) })
const paragraph = (...content: unknown[]) => ({ type: 'paragraph', content })
const doc = (...content: unknown[]) => ({ type: 'doc', content })
const image = (src: unknown, attrs: Record<string, unknown> = {}) => ({ type: 'image', attrs: { src, ...attrs } })
const link = (attrs: Record<string, unknown>) => ({ type: 'link', attrs })
const nest = (depth: number, wrap: (inner: unknown) => unknown, innermost: unknown): unknown =>
    Array.from({ length: depth }).reduce((inner) => wrap(inner), innermost)

describe('리치 텍스트 검증', () => {
    test('허용된 노드와 마크로 구성된 문서를 통과시킵니다', () => {
        const result = parseRichTextDocument(
            doc(
                { type: 'heading', attrs: { level: 2 }, content: [text('제목')] },
                paragraph(text('굵게', [{ type: 'bold' }, { type: 'underline' }]), { type: 'hardBreak' }, text('기울임', [{ type: 'italic' }])),
                paragraph(text('링크', [link({ href: 'https://example.com/path?query=1' })])),
                { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph(text('항목'))] }] },
                { type: 'orderedList', attrs: { start: 3, type: 'a' }, content: [{ type: 'listItem', content: [paragraph(text('순서'))] }] },
                { type: 'blockquote', content: [paragraph(text('인용', [{ type: 'strike' }]))] },
                { type: 'codeBlock', attrs: { language: 'ts' }, content: [text('const a = 1')] },
                { type: 'horizontalRule' },
                image(BOARD_IMAGE_SOURCE, { alt: '설명', width: 320, height: 240 }),
            ),
        )

        expect(result.ok).toBe(true)
    })

    test('스키마에 없는 속성과 필드를 제거하고 기본값을 채웁니다', () => {
        const result = parseRichTextDocument(
            doc(
                {
                    ...paragraph(text('본문', [link({ href: 'http://example.com', onclick: 'alert(1)' })])),
                    attrs: { style: 'color:red' },
                    extra: true,
                },
                image(BOARD_IMAGE_SOURCE, { onerror: 'alert(1)' }),
            ),
        )

        expect(result).toEqual({
            ok: true,
            document: {
                type: 'doc',
                content: [
                    {
                        type: 'paragraph',
                        content: [
                            {
                                type: 'text',
                                text: '본문',
                                marks: [{ type: 'link', attrs: { href: 'http://example.com', title: null, ...RICH_TEXT_LINK_HTML_ATTRIBUTES } }],
                            },
                        ],
                    },
                    { type: 'image', attrs: { src: BOARD_IMAGE_SOURCE, alt: null, title: null, width: null, height: null } },
                ],
            },
        })
    })

    test('표시용 속성은 안전한 값으로 정규화합니다', () => {
        const result = parseRichTextDocument(
            doc(
                paragraph(text('링크', [link({ href: 'https://example.com', target: '_self', rel: 'opener', class: 'fixed inset-0', title: 7 })])),
                { type: 'codeBlock', attrs: { language: 'ts fixed inset-0' }, content: [text('code')] },
                { type: 'orderedList', attrs: { start: 'x', type: {} }, content: [{ type: 'listItem', content: [paragraph(text('순서'))] }] },
                image(BOARD_IMAGE_SOURCE, { alt: {}, title: 1, width: '100%', height: -1 }),
            ),
        )

        expect(result.ok && result.document.content).toEqual([
            {
                type: 'paragraph',
                content: [
                    {
                        type: 'text',
                        text: '링크',
                        marks: [{ type: 'link', attrs: { href: 'https://example.com', title: null, ...RICH_TEXT_LINK_HTML_ATTRIBUTES } }],
                    },
                ],
            },
            { type: 'codeBlock', attrs: { language: null }, content: [{ type: 'text', text: 'code' }] },
            {
                type: 'orderedList',
                attrs: { start: 1, type: null },
                content: [{ type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: '순서' }] }] }],
            },
            { type: 'image', attrs: { src: BOARD_IMAGE_SOURCE, alt: null, title: null, width: null, height: null } },
        ])
    })

    test('루트가 doc이 아니거나 객체가 아닌 입력을 거부합니다', () => {
        for (const input of [paragraph(text('본문')), text('본문'), null, undefined, 'doc', 1, [], {}])
            expect(parseRichTextDocument(input)).toEqual({ ok: false, reason: 'INVALID_STRUCTURE' })
    })

    test('허용되지 않은 노드·마크와 잘못된 구조를 거부합니다', () => {
        for (const input of [
            doc({ type: 'iframe', attrs: { src: 'https://example.com' } }),
            doc(paragraph({ type: 'script', content: [text('alert(1)')] })),
            doc(paragraph(text('본문', [{ type: 'textStyle', attrs: { color: 'red' } }]))),
            doc(paragraph(paragraph(text('본문')))),
            doc(paragraph(text(''))),
            doc(text('본문')),
            doc({ type: 'bulletList', content: [paragraph(text('항목'))] }),
        ])
            expect(parseRichTextDocument(input)).toEqual({ ok: false, reason: 'INVALID_STRUCTURE' })
    })

    test('http·https가 아닌 링크를 거부합니다', () => {
        for (const href of [
            'javascript:alert(1)',
            ' javascript:alert(1)',
            'JAVASCRIPT:alert(1)',
            'data:text/html,x',
            'mailto:a@example.com',
            '//example.com',
            '/board',
            '',
            null,
            { href: 'https://example.com' },
        ])
            expect(parseRichTextDocument(doc(paragraph(text('링크', [link({ href })]))))).toEqual({ ok: false, reason: 'INVALID_ATTRIBUTE' })
    })

    test('게시판 파일 주소가 아닌 이미지 src를 거부합니다', () => {
        for (const src of [
            'https://example.com/image.png',
            `https://example.com${BOARD_IMAGE_SOURCE}`,
            'data:image/png;base64,AAAA',
            'javascript:alert(1)',
            AVATAR_IMAGE_SOURCE,
            `${BOARD_IMAGE_SOURCE}?size=1`,
            `${BOARD_IMAGE_SOURCE}/../x.png`,
            '/api/files/board/../avatar/3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b.png',
            '/api/files/board/3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b.svg',
            { toString: BOARD_IMAGE_SOURCE },
            [BOARD_IMAGE_SOURCE],
            null,
        ])
            expect(parseRichTextDocument(doc(image(src)))).toEqual({ ok: false, reason: 'INVALID_ATTRIBUTE' })
    })

    test('허용 범위 밖의 제목 단계를 거부합니다', () => {
        for (const level of [1, 4, 9, '2', null])
            expect(parseRichTextDocument(doc({ type: 'heading', attrs: { level }, content: [text('제목')] }))).toEqual({
                ok: false,
                reason: 'INVALID_ATTRIBUTE',
            })

        for (const level of [2, 3]) expect(parseRichTextDocument(doc({ type: 'heading', attrs: { level }, content: [text('제목')] })).ok).toBe(true)
    })

    test('이미지는 상한 개수까지만 허용합니다', () => {
        const images = (count: number) => Array.from({ length: count }, () => image(BOARD_IMAGE_SOURCE))

        expect(parseRichTextDocument(doc(...images(RICH_TEXT_MAX_IMAGES))).ok).toBe(true)
        expect(parseRichTextDocument(doc(...images(RICH_TEXT_MAX_IMAGES + 1)))).toEqual({ ok: false, reason: 'TOO_MANY_IMAGES' })
    })

    test('글자도 이미지도 없는 문서를 거부합니다', () => {
        for (const input of [
            doc({ type: 'paragraph' }),
            doc(paragraph(text('   '))),
            doc(paragraph({ type: 'hardBreak' })),
            doc({ type: 'horizontalRule' }),
        ])
            expect(parseRichTextDocument(input)).toEqual({ ok: false, reason: 'EMPTY' })

        expect(parseRichTextDocument(doc(image(BOARD_IMAGE_SOURCE))).ok).toBe(true)
    })

    test('직렬화 크기가 상한을 넘으면 거부합니다', () => {
        expect(parseRichTextDocument(doc(paragraph(text('가'.repeat(RICH_TEXT_MAX_BYTES)))))).toEqual({ ok: false, reason: 'TOO_LARGE' })
        expect(parseRichTextDocument(doc(paragraph(text('a'.repeat(RICH_TEXT_MAX_BYTES)))))).toEqual({ ok: false, reason: 'TOO_LARGE' })
    })

    test('지나치게 깊게 중첩된 입력을 스택 오버플로 없이 거부합니다', () => {
        const deepContent = doc(nest(NESTING_BEYOND_LIMIT, (inner) => ({ type: 'blockquote', content: [inner] }), paragraph(text('본문'))))
        const deepAttributes = doc({ type: 'paragraph', attrs: nest(NESTING_BEYOND_LIMIT, (inner) => ({ a: inner }), 1), content: [text('본문')] })
        const deepArrays = doc(
            paragraph(text('본문')),
            nest(NESTING_BEYOND_LIMIT, (inner) => [inner], 1),
        )

        for (const input of [deepContent, deepAttributes, deepArrays]) expect(parseRichTextDocument(input)).toEqual({ ok: false, reason: 'TOO_DEEP' })
    })

    test('여러 단계로 중첩된 목록은 허용합니다', () => {
        const nestedList = nest(
            10,
            (inner) => ({ type: 'bulletList', content: [{ type: 'listItem', content: [paragraph(text('항목')), inner] }] }),
            paragraph(text('끝')),
        )

        expect(parseRichTextDocument(doc(nestedList)).ok).toBe(true)
    })
})

describe('리치 텍스트 평문 추출', () => {
    test('블록은 줄바꿈으로 나누고 인라인 글자는 이어 붙입니다', () => {
        const result = parseRichTextDocument(
            doc(
                { type: 'heading', attrs: { level: 2 }, content: [text('제목')] },
                paragraph(text('첫 '), text('문장', [{ type: 'bold' }]), { type: 'hardBreak' }, text('둘째 줄')),
                image(BOARD_IMAGE_SOURCE),
                { type: 'bulletList', content: [{ type: 'listItem', content: [paragraph(text('항목'))] }] },
            ),
        )

        expect(result.ok && getRichTextPlainText(result.document)).toBe('제목\n첫 문장\n둘째 줄\n항목')
    })
})

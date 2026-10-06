import { describe, expect, test } from 'bun:test'
import { getBoardListPathname, getBoardPostPathname } from '@entities/board/board-page'
import { getRichTextSummary } from '@entities/board/rich-text-summary'

const paragraph = (text: string) => ({ type: 'paragraph', content: [{ type: 'text', text }] })
const image = (src: string) => ({ type: 'image', attrs: { src } })

describe('리치 텍스트 요약', () => {
    test('문서가 없으면 빈 본문과 이미지 없음을 반환합니다', () => {
        expect(getRichTextSummary(null)).toEqual({ text: '', imageSource: null })
    })

    test('블록을 줄바꿈으로 이은 평문과 첫 이미지를 반환합니다', () => {
        const document = {
            type: 'doc',
            content: [paragraph('첫 문단'), image('/api/files/board/first.png'), paragraph('둘째 문단'), image('/api/files/board/second.png')],
        }

        expect(getRichTextSummary(document)).toEqual({ text: '첫 문단\n둘째 문단', imageSource: '/api/files/board/first.png' })
    })

    test('목록 안에 중첩된 이미지도 찾습니다', () => {
        const document = {
            type: 'doc',
            content: [{ type: 'bulletList', content: [{ type: 'listItem', content: [paragraph('항목'), image('/api/files/board/nested.png')] }] }],
        }

        expect(getRichTextSummary(document).imageSource).toBe('/api/files/board/nested.png')
    })

    test('이미지가 없으면 null을 반환합니다', () => {
        expect(getRichTextSummary({ type: 'doc', content: [paragraph('글')] }).imageSource).toBeNull()
    })
})

describe('게시판 경로', () => {
    test('첫 페이지는 쿼리 없이, 2페이지부터는 page 쿼리를 붙입니다', () => {
        expect(getBoardListPathname(1)).toBe('/board')
        expect(getBoardListPathname(2)).toBe('/board?page=2')
    })

    test('게시글 경로는 게시판 아래에 id를 붙입니다', () => {
        expect(getBoardPostPathname('abc')).toBe('/board/abc')
    })
})

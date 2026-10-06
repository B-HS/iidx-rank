import { describe, expect, test } from 'bun:test'
import {
    BOARD_COMMENT_MAX_LENGTH,
    BOARD_POST_TITLE_MAX_LENGTH,
    BoardIdSchema,
    BoardPageQuerySchema,
    CommentCreateInputSchema,
    PostCreateInputSchema,
    PostUpdateInputSchema,
} from '@entities/board/board.dto'

const content = { type: 'doc', content: [{ type: 'paragraph' }] }

describe('게시글 입력', () => {
    test('제목의 앞뒤 공백을 제거합니다', () => {
        expect(PostCreateInputSchema.parse({ kind: 'general', title: '  제목  ', content }).title).toBe('제목')
        expect(PostUpdateInputSchema.parse({ title: '\n제목\t', content }).title).toBe('제목')
    })

    test('공백뿐이거나 길이를 넘는 제목을 거부합니다', () => {
        for (const title of ['', '   ', 'a'.repeat(BOARD_POST_TITLE_MAX_LENGTH + 1), 1, null])
            expect(PostUpdateInputSchema.safeParse({ title, content }).success).toBe(false)

        expect(PostUpdateInputSchema.safeParse({ title: 'a'.repeat(BOARD_POST_TITLE_MAX_LENGTH), content }).success).toBe(true)
        expect(PostUpdateInputSchema.safeParse({ title: ` ${'a'.repeat(BOARD_POST_TITLE_MAX_LENGTH)} `, content }).success).toBe(true)
    })

    test('알 수 없는 종류와 추가 필드를 거부합니다', () => {
        expect(PostCreateInputSchema.safeParse({ kind: 'pinned', title: '제목', content }).success).toBe(false)
        expect(PostCreateInputSchema.safeParse({ kind: 'general', title: '제목', content, authorId: 'x' }).success).toBe(false)
        expect(PostUpdateInputSchema.safeParse({ kind: 'notice', title: '제목', content }).success).toBe(false)
    })

    test('본문은 객체만 받습니다', () => {
        for (const value of ['<p>본문</p>', null, undefined, 1, [content]])
            expect(PostUpdateInputSchema.safeParse({ title: '제목', content: value }).success).toBe(false)
    })
})

describe('댓글 입력', () => {
    test('앞뒤 공백을 제거하고 길이를 검사합니다', () => {
        expect(CommentCreateInputSchema.parse({ content: '  댓글  ' }).content).toBe('댓글')
        expect(CommentCreateInputSchema.safeParse({ content: 'a'.repeat(BOARD_COMMENT_MAX_LENGTH) }).success).toBe(true)

        for (const value of ['', '  \n ', 'a'.repeat(BOARD_COMMENT_MAX_LENGTH + 1), 1, null])
            expect(CommentCreateInputSchema.safeParse({ content: value }).success).toBe(false)
    })
})

describe('목록 쿼리와 식별자', () => {
    test('page를 숫자로 강제 변환하고 생략하면 1로 둡니다', () => {
        expect(BoardPageQuerySchema.parse({})).toEqual({ page: 1 })
        expect(BoardPageQuerySchema.parse({ page: '3' })).toEqual({ page: 3 })
        expect(BoardPageQuerySchema.parse({ page: 2 })).toEqual({ page: 2 })
    })

    test('양의 정수가 아닌 page를 거부합니다', () => {
        for (const page of ['0', '-1', '1.5', 'abc', '', null]) expect(BoardPageQuerySchema.safeParse({ page }).success).toBe(false)
    })

    test('UUID가 아닌 식별자를 거부합니다', () => {
        expect(BoardIdSchema.safeParse(crypto.randomUUID()).success).toBe(true)

        for (const id of ['1', '../x', '', 'not-a-uuid']) expect(BoardIdSchema.safeParse(id).success).toBe(false)
    })
})

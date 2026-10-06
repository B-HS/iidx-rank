import { describe, expect, test } from 'bun:test'
import { createPagination, PaginationSchema } from '@shared/lib/pagination'

describe('createPagination', () => {
    test('전체 개수를 페이지 크기로 올림해 전체 페이지 수를 계산합니다', () => {
        expect(createPagination(1, 20, 21)).toEqual({ page: 1, limit: 20, total: 21, totalPages: 2 })
        expect(createPagination(2, 20, 40).totalPages).toBe(2)
    })
    test('항목이 없으면 전체 페이지 수는 0입니다', () => {
        expect(PaginationSchema.parse(createPagination(1, 20, 0)).totalPages).toBe(0)
    })
})

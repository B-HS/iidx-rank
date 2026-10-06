import { describe, expect, test } from 'bun:test'
import { getPaginationItems } from '@features/board-pagination/get-pagination-items'

const toLabels = (page: number, totalPages: number) => getPaginationItems(page, totalPages).map((item) => (item.kind === 'page' ? item.page : '…'))

describe('페이지 번호 계산', () => {
    test('페이지가 없으면 빈 목록을 반환합니다', () => {
        expect(getPaginationItems(1, 0)).toEqual([])
    })

    test('페이지 수가 적으면 모든 번호를 표시합니다', () => {
        expect(toLabels(1, 1)).toEqual([1])
        expect(toLabels(2, 3)).toEqual([1, 2, 3])
        expect(toLabels(1, 4)).toEqual([1, 2, 3, 4])
    })

    test('현재 페이지 주변과 처음·끝만 남기고 건너뛴 구간은 줄임표로 표시합니다', () => {
        expect(toLabels(1, 10)).toEqual([1, 2, '…', 10])
        expect(toLabels(5, 10)).toEqual([1, '…', 4, 5, 6, '…', 10])
        expect(toLabels(10, 10)).toEqual([1, '…', 9, 10])
    })

    test('한 페이지만 건너뛰는 구간은 줄임표 대신 번호를 표시합니다', () => {
        expect(toLabels(3, 10)).toEqual([1, 2, 3, 4, '…', 10])
        expect(toLabels(8, 10)).toEqual([1, '…', 7, 8, 9, 10])
        expect(toLabels(4, 10)).toEqual([1, 2, 3, 4, 5, '…', 10])
    })

    test('범위를 벗어난 현재 페이지는 가장 가까운 유효 페이지로 맞춥니다', () => {
        expect(toLabels(0, 10)).toEqual([1, 2, '…', 10])
        expect(toLabels(99, 10)).toEqual([1, '…', 9, 10])
    })

    test('줄임표 항목은 서로 다른 키를 가집니다', () => {
        const keys = getPaginationItems(5, 10).flatMap((item) => (item.kind === 'ellipsis' ? [item.key] : []))

        expect(new Set(keys).size).toBe(keys.length)
        expect(keys).toHaveLength(2)
    })
})

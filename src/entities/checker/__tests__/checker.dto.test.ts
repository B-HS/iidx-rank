import { describe, expect, test } from 'bun:test'
import { MAX_MEMO_LENGTH, RecordInputSchema } from '@entities/checker/checker.dto'
const CHART_ID = 'chart-0123456789abcdef0123456789abcdef'
describe('기록 입력 스키마', () => {
    test('생략한 메모와 DJ 랭크는 결과에 포함하지 않습니다', () => {
        const input = RecordInputSchema.parse({ chartId: CHART_ID, lamp: 'CLEAR' })
        expect(input).toEqual({ chartId: CHART_ID, lamp: 'CLEAR' })
        expect('memo' in input).toBe(false)
        expect('scoreGrade' in input).toBe(false)
    })
    test('빈 메모와 null DJ 랭크는 삭제 의도로 그대로 유지합니다', () => {
        const input = RecordInputSchema.parse({ chartId: CHART_ID, lamp: 'CLEAR', memo: '', scoreGrade: null })
        expect(input.memo).toBe('')
        expect(input.scoreGrade).toBeNull()
    })
    test('메모가 최대 길이를 초과하면 실패합니다', () => {
        expect(RecordInputSchema.safeParse({ chartId: CHART_ID, lamp: 'CLEAR', memo: 'a'.repeat(MAX_MEMO_LENGTH) }).success).toBe(true)
        expect(RecordInputSchema.safeParse({ chartId: CHART_ID, lamp: 'CLEAR', memo: 'a'.repeat(MAX_MEMO_LENGTH + 1) }).success).toBe(false)
    })
})

import { describe, expect, test } from 'bun:test'
import { MAX_MEMO_LENGTH, RecordInputSchema, RecordSchema } from '@entities/checker/checker.dto'
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
    test('EX SCORE·MISS COUNT·출처는 수동 저장 입력으로 받지 않습니다', () => {
        const input = RecordInputSchema.parse({ chartId: CHART_ID, lamp: 'CLEAR', exScore: 3000, missCount: 1, source: 'eamusement' })
        expect(input).toEqual({ chartId: CHART_ID, lamp: 'CLEAR' })
    })
})
describe('기록 스키마', () => {
    const RECORD = { chartId: CHART_ID, lamp: 'CLEAR', memo: '', updatedAt: '2026-10-07T10:05:00.000Z' }
    test('이전 형식의 기록은 EX SCORE·MISS COUNT가 null이고 출처가 manual입니다', () => {
        expect<unknown>(RecordSchema.parse(RECORD)).toEqual({ ...RECORD, scoreGrade: null, exScore: null, missCount: null, source: 'manual' })
    })
    test('가져온 기록의 EX SCORE·MISS COUNT·출처를 유지합니다', () => {
        const record = { ...RECORD, scoreGrade: 'AAA', exScore: 3123, missCount: 0, source: 'eamusement' }
        expect<unknown>(RecordSchema.parse(record)).toEqual(record)
    })
    test('음수 점수와 알 수 없는 출처를 거부합니다', () => {
        expect(RecordSchema.safeParse({ ...RECORD, exScore: -1 }).success).toBe(false)
        expect(RecordSchema.safeParse({ ...RECORD, missCount: 0.5 }).success).toBe(false)
        expect(RecordSchema.safeParse({ ...RECORD, source: 'csv' }).success).toBe(false)
    })
})

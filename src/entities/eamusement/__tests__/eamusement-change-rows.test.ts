import { describe, expect, test } from 'bun:test'
import { toImportChangeRows } from '@entities/eamusement/eamusement-change-rows'

const KNOWN_CHART_ID = 'chart-00000000000000000000000000000001'
const UNKNOWN_CHART_ID = 'chart-00000000000000000000000000000002'
const CHARTS = [{ id: KNOWN_CHART_ID, title: '冥', difficulty: 'A' }] as const
const CHANGE = { chartId: KNOWN_CHART_ID, previousLamp: 'CLEAR', lamp: 'HARD', scoreGrade: 'AA', exScore: 3000 } as const

describe('바뀐 차트 표의 행', () => {
    test('chartId를 catalog의 곡명과 패턴으로 바꿉니다', () => {
        expect(toImportChangeRows([CHANGE], CHARTS)).toEqual([{ ...CHANGE, title: '冥', difficulty: 'A' }])
    })
    test('catalog에 없는 차트는 행을 유지하고 곡명과 패턴을 null로 둡니다', () => {
        const unknownChange = { ...CHANGE, chartId: UNKNOWN_CHART_ID, previousLamp: null }

        expect(toImportChangeRows([CHANGE, unknownChange], CHARTS)).toEqual([
            { ...CHANGE, title: '冥', difficulty: 'A' },
            { ...unknownChange, title: null, difficulty: null },
        ])
    })
})

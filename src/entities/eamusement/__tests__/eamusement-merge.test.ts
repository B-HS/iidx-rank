import { describe, expect, test } from 'bun:test'
import type { ImportChart } from '@entities/eamusement/eamusement.dto'
import { planImport, summarizeImportChanges } from '@entities/eamusement/eamusement-merge'
import { IMPORT_CHANGES_LIMIT, IMPORT_UNMATCHED_LIMIT } from '@shared/constants/eamusement'

const createChartId = (index: number) => `chart-${index.toString(16).padStart(32, '0')}`

const FIRST_CHART_ID = createChartId(1)
const SECOND_CHART_ID = createChartId(2)
const INACTIVE_CHART_ID = createChartId(3)
const ACTIVE_CHART_IDS = new Set([FIRST_CHART_ID, SECOND_CHART_ID])
const RECORDED_AT = '2026-10-01T00:00:00.000Z'
const OBSERVED_AT = '2026-10-07T00:00:00.000Z'
const BEFORE_RECORDED_AT = '2026-09-30T00:00:00.000Z'

const createChart = (overrides: Partial<ImportChart>): ImportChart => ({
    chartId: FIRST_CHART_ID,
    title: '冥',
    difficulty: 'A',
    level: 12,
    lamp: 'HARD',
    scoreGrade: 'AA',
    exScore: 3000,
    missCount: 12,
    ...overrides,
})

const toRecordValues = ({ chartId, lamp, scoreGrade, exScore, missCount }: ImportChart) => ({ chartId, lamp, scoreGrade, exScore, missCount })

const toChange = (chart: ImportChart, previousLamp: ImportChart['lamp'] | null = null) => ({ ...toRecordValues(chart), previousLamp })

const toCurrentRecord = (chart: ImportChart) => ({ ...toRecordValues(chart), updatedAt: RECORDED_AT })

describe('가져오기 반영 계획', () => {
    test('기록이 없는 레벨 12 활성 차트는 새 기록으로 반영합니다', () => {
        const chart = createChart({})
        const plan = planImport([], ACTIVE_CHART_IDS, [chart], OBSERVED_AT)

        expect(plan).toEqual({ receivedCount: 1, matchedCount: 1, changedCount: 1, changes: [toChange(chart)], unmatched: [] })
    })
    test('네 값이 모두 같으면 아무것도 바꾸지 않습니다', () => {
        const chart = createChart({})
        const plan = planImport([toCurrentRecord(chart)], ACTIVE_CHART_IDS, [chart], OBSERVED_AT)

        expect(plan.matchedCount).toBe(1)
        expect(plan.changedCount).toBe(0)
        expect(plan.changes).toEqual([])
    })
    test('램프·DJ 랭크·EX SCORE·MISS COUNT 중 하나만 달라도 가져온 값으로 바꿉니다', () => {
        const current = toCurrentRecord(createChart({}))
        const variants = [
            createChart({ lamp: 'EASY' }),
            createChart({ scoreGrade: 'AAA' }),
            createChart({ exScore: 3001 }),
            createChart({ missCount: 3 }),
        ]

        for (const variant of variants) {
            expect(planImport([current], ACTIVE_CHART_IDS, [variant], OBSERVED_AT).changes).toEqual([toChange(variant, current.lamp)])
        }
    })
    test('가져온 값이 null인 항목은 값이 없는 것으로 보고 기존 값을 유지합니다', () => {
        const current = toCurrentRecord(createChart({}))
        const withoutDetails = createChart({ scoreGrade: null, exScore: null, missCount: null })

        expect(planImport([current], ACTIVE_CHART_IDS, [withoutDetails], OBSERVED_AT).changes).toEqual([])
        expect(planImport([current], ACTIVE_CHART_IDS, [{ ...withoutDetails, lamp: 'EX_HARD' }], OBSERVED_AT).changes).toEqual([
            { ...toChange(createChart({}), current.lamp), lamp: 'EX_HARD' },
        ])
    })
    test('바뀐 차트마다 이전 램프를 함께 돌려주고 기록이 없던 차트는 null입니다', () => {
        const current = toCurrentRecord(createChart({ lamp: 'CLEAR' }))
        const plan = planImport(
            [current],
            ACTIVE_CHART_IDS,
            [createChart({ lamp: 'HARD' }), createChart({ chartId: SECOND_CHART_ID, lamp: 'EASY' })],
            OBSERVED_AT,
        )

        expect(plan.changes.map(({ chartId, previousLamp, lamp }) => ({ chartId, previousLamp, lamp }))).toEqual([
            { chartId: FIRST_CHART_ID, previousLamp: 'CLEAR', lamp: 'HARD' },
            { chartId: SECOND_CHART_ID, previousLamp: null, lamp: 'EASY' },
        ])
    })
    test('기존 램프가 NO_PLAY인 기록은 이전 램프를 NO_PLAY로 돌려줍니다', () => {
        const current = toCurrentRecord(createChart({ lamp: 'NO_PLAY', scoreGrade: null, exScore: null, missCount: null }))

        expect(planImport([current], ACTIVE_CHART_IDS, [createChart({})], OBSERVED_AT).changes).toEqual([toChange(createChart({}), 'NO_PLAY')])
    })
    test('수집 시각보다 나중에 바뀐 기록은 덮어쓰지 않습니다', () => {
        const current = toCurrentRecord(createChart({}))
        const olderImport = createChart({ lamp: 'EASY' })

        expect(planImport([current], ACTIVE_CHART_IDS, [olderImport], BEFORE_RECORDED_AT).changes).toEqual([])
        expect(planImport([current], ACTIVE_CHART_IDS, [olderImport], RECORDED_AT).changes).toEqual([toChange(olderImport, current.lamp)])
    })
    test('NO_PLAY는 일치 건수에는 넣지만 기존 기록을 지우지 않습니다', () => {
        const current = toCurrentRecord(createChart({}))
        const plan = planImport(
            [current],
            ACTIVE_CHART_IDS,
            [createChart({ lamp: 'NO_PLAY', scoreGrade: null, exScore: null, missCount: null })],
            OBSERVED_AT,
        )

        expect(plan.matchedCount).toBe(1)
        expect(plan.changes).toEqual([])
    })
    test('레벨 12가 아닌 차트는 일치·미일치 어디에도 넣지 않습니다', () => {
        const plan = planImport(
            [],
            ACTIVE_CHART_IDS,
            [createChart({ level: 11 }), createChart({ chartId: INACTIVE_CHART_ID, level: 10 })],
            OBSERVED_AT,
        )

        expect(plan).toEqual({ receivedCount: 2, matchedCount: 0, changedCount: 0, changes: [], unmatched: [] })
    })
    test('활성 catalog에 없는 레벨 12 차트는 미일치로 돌려주고 반영하지 않습니다', () => {
        const plan = planImport([], ACTIVE_CHART_IDS, [createChart({ chartId: INACTIVE_CHART_ID, title: '없는 곡', difficulty: 'L' })], OBSERVED_AT)

        expect(plan.matchedCount).toBe(0)
        expect(plan.changes).toEqual([])
        expect(plan.unmatched).toEqual([{ title: '없는 곡', difficulty: 'L' }])
    })
    test('같은 chartId가 중복되면 마지막 항목만 씁니다', () => {
        const lastChart = createChart({ lamp: 'FULL_COMBO', exScore: 3100 })
        const plan = planImport([], ACTIVE_CHART_IDS, [createChart({}), createChart({ chartId: SECOND_CHART_ID }), lastChart], OBSERVED_AT)

        expect(plan.receivedCount).toBe(3)
        expect(plan.matchedCount).toBe(2)
        expect(plan.changes).toEqual([toChange(lastChart), toChange(createChart({ chartId: SECOND_CHART_ID }))])
    })
    test('미일치 목록은 최대 건수까지만 돌려줍니다', () => {
        const charts = Array.from({ length: IMPORT_UNMATCHED_LIMIT + 1 }, (_, index) => createChart({ chartId: createChartId(index + 10) }))

        expect(planImport([], ACTIVE_CHART_IDS, charts, OBSERVED_AT).unmatched).toHaveLength(IMPORT_UNMATCHED_LIMIT)
    })
})

describe('응답의 변경 목록', () => {
    test('DB에 쓰는 MISS COUNT를 빼고 계약의 다섯 필드만 돌려줍니다', () => {
        const current = toCurrentRecord(createChart({ lamp: 'CLEAR' }))
        const { changes } = planImport([current], ACTIVE_CHART_IDS, [createChart({})], OBSERVED_AT)

        expect(summarizeImportChanges(changes)).toEqual([
            { chartId: FIRST_CHART_ID, previousLamp: 'CLEAR', lamp: 'HARD', scoreGrade: 'AA', exScore: 3000 },
        ])
    })
    test('최대 건수까지만 돌려주고 반영 계획의 건수는 줄이지 않습니다', () => {
        const charts = Array.from({ length: IMPORT_CHANGES_LIMIT + 1 }, (_, index) => createChart({ chartId: createChartId(index + 10) }))
        const plan = planImport([], new Set(charts.map((chart) => chart.chartId)), charts, OBSERVED_AT)

        expect(plan.changedCount).toBe(IMPORT_CHANGES_LIMIT + 1)
        expect(plan.changes).toHaveLength(IMPORT_CHANGES_LIMIT + 1)
        expect(summarizeImportChanges(plan.changes)).toHaveLength(IMPORT_CHANGES_LIMIT)
    })
})

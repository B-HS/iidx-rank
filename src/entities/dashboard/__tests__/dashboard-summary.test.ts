import { describe, expect, test } from 'bun:test'
import type { Chart } from '@entities/catalog/catalog.dto'
import { RANKS } from '@entities/catalog/catalog.dto'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { LAMPS, SCORE_GRADES } from '@entities/checker/checker.dto'
import { getLampSummary, getRankAchievement, getRecentRecords, getScoreGradeDistribution } from '@entities/dashboard/dashboard-summary'

const CHART_ID_HEX_LENGTH = 32
const EARLIER = '2026-10-01T00:00:00.000Z'
const LATER = '2026-10-02T00:00:00.000Z'
const LATEST = '2026-10-03T00:00:00.000Z'

const chartId = (index: number) => `chart-${index.toString(16).padStart(CHART_ID_HEX_LENGTH, '0')}`

const createChart = (index: number, overrides: Partial<Chart> = {}): Chart => ({
    id: chartId(index),
    title: `title-${index}`,
    difficulty: 'A',
    version: 'version',
    normalRank: null,
    hardRank: null,
    normalPersonal: false,
    hardPersonal: false,
    ...overrides,
})

const createRecord = (index: number, overrides: Partial<ChartRecord> = {}): ChartRecord => ({
    chartId: chartId(index),
    lamp: 'CLEAR',
    scoreGrade: null,
    exScore: null,
    missCount: null,
    source: 'manual',
    memo: '',
    updatedAt: EARLIER,
    ...overrides,
})

const INACTIVE_CHART_INDEX = 99

describe('getLampSummary', () => {
    test('catalog가 비어 있으면 기록이 있어도 모든 수가 0이다', () => {
        const summary = getLampSummary([], [createRecord(1, { lamp: 'HARD' })])

        expect(summary.total).toBe(0)
        expect(summary.played).toBe(0)
        expect(summary.lamps).toEqual(LAMPS.map((lamp) => ({ lamp, count: 0 })))
    })

    test('기록이 없으면 모든 차트를 NO_PLAY로 센다', () => {
        const summary = getLampSummary([createChart(1), createChart(2)], [])

        expect(summary.total).toBe(2)
        expect(summary.played).toBe(0)
        expect(summary.lamps.find(({ lamp }) => lamp === 'NO_PLAY')?.count).toBe(2)
    })

    test('램프를 LAMPS 순서로 세고 NO_PLAY 기록은 플레이한 수에서 뺀다', () => {
        const charts = [1, 2, 3, 4, 5].map((index) => createChart(index))
        const records = [
            createRecord(1, { lamp: 'HARD' }),
            createRecord(2, { lamp: 'HARD' }),
            createRecord(3, { lamp: 'FAILED' }),
            createRecord(4, { lamp: 'NO_PLAY' }),
        ]
        const summary = getLampSummary(charts, records)

        expect(summary.lamps.map(({ lamp }) => lamp)).toEqual([...LAMPS])
        expect(summary.lamps.filter(({ count }) => count > 0)).toEqual([
            { lamp: 'NO_PLAY', count: 2 },
            { lamp: 'FAILED', count: 1 },
            { lamp: 'HARD', count: 2 },
        ])
        expect(summary.played).toBe(3)
        expect(summary.total).toBe(5)
    })

    test('catalog에 없는 비활성 차트의 기록은 세지 않는다', () => {
        const summary = getLampSummary(
            [createChart(1)],
            [createRecord(1, { lamp: 'EASY' }), createRecord(INACTIVE_CHART_INDEX, { lamp: 'FULL_COMBO' })],
        )

        expect(summary.total).toBe(1)
        expect(summary.played).toBe(1)
        expect(summary.lamps.find(({ lamp }) => lamp === 'FULL_COMBO')?.count).toBe(0)
        expect(summary.lamps.reduce((sum, { count }) => sum + count, 0)).toBe(summary.total)
    })
})

describe('getRankAchievement', () => {
    test('빈 catalog에서도 높은 랭크부터 미정까지 모든 구간을 0으로 돌려준다', () => {
        const achievement = getRankAchievement([], [])
        const expected = [...RANKS.toReversed(), null].map((rank) => ({ rank, total: 0, achieved: 0 }))

        expect(achievement.normal).toEqual(expected)
        expect(achievement.hard).toEqual(expected)
        expect(achievement.normal[0]?.rank).toBe('S+')
        expect(achievement.normal.at(-1)?.rank).toBeNull()
    })

    test('노멀은 CLEAR 이상, 하드는 HARD 이상만 달성으로 센다', () => {
        const charts = LAMPS.map((_, index) => createChart(index, { normalRank: 'A', hardRank: 'S' }))
        const records = LAMPS.map((lamp, index) => createRecord(index, { lamp }))
        const achievement = getRankAchievement(charts, records)

        expect(achievement.normal.find(({ rank }) => rank === 'A')).toEqual({ rank: 'A', total: LAMPS.length, achieved: 4 })
        expect(achievement.hard.find(({ rank }) => rank === 'S')).toEqual({ rank: 'S', total: LAMPS.length, achieved: 3 })
    })

    test('노멀 랭크와 하드 랭크를 따로 묶고 랭크가 null인 차트는 미정 구간에 넣는다', () => {
        const charts = [
            createChart(1, { normalRank: 'S+', hardRank: null }),
            createChart(2, { normalRank: null, hardRank: 'B+' }),
            createChart(3, { normalRank: null, hardRank: null }),
        ]
        const records = [createRecord(1, { lamp: 'HARD' }), createRecord(2, { lamp: 'CLEAR' }), createRecord(3, { lamp: 'EX_HARD' })]
        const achievement = getRankAchievement(charts, records)

        expect(achievement.normal.find(({ rank }) => rank === 'S+')).toEqual({ rank: 'S+', total: 1, achieved: 1 })
        expect(achievement.normal.find(({ rank }) => rank === null)).toEqual({ rank: null, total: 2, achieved: 2 })
        expect(achievement.hard.find(({ rank }) => rank === 'B+')).toEqual({ rank: 'B+', total: 1, achieved: 0 })
        expect(achievement.hard.find(({ rank }) => rank === null)).toEqual({ rank: null, total: 2, achieved: 2 })
    })

    test('기록이 없는 차트와 비활성 차트의 기록은 달성으로 세지 않는다', () => {
        const achievement = getRankAchievement(
            [createChart(1, { normalRank: 'F', hardRank: 'F' })],
            [createRecord(INACTIVE_CHART_INDEX, { lamp: 'FULL_COMBO' })],
        )

        expect(achievement.normal.find(({ rank }) => rank === 'F')).toEqual({ rank: 'F', total: 1, achieved: 0 })
        expect(achievement.hard.find(({ rank }) => rank === 'F')).toEqual({ rank: 'F', total: 1, achieved: 0 })
        expect(achievement.normal.reduce((sum, { total }) => sum + total, 0)).toBe(1)
    })
})

describe('getRecentRecords', () => {
    test('catalog나 기록이 비어 있으면 빈 목록이다', () => {
        expect(getRecentRecords([], [createRecord(1)], 5)).toEqual([])
        expect(getRecentRecords([createChart(1)], [], 5)).toEqual([])
    })

    test('갱신 시각 내림차순으로 정렬하고 차트 정보를 합친다', () => {
        const charts = [
            createChart(1, { title: '첫 곡', difficulty: 'L', version: '32', normalRank: 'S', hardRank: 'A+' }),
            createChart(2),
            createChart(3),
        ]
        const records = [
            createRecord(2, { updatedAt: EARLIER }),
            createRecord(1, { lamp: 'EX_HARD', scoreGrade: 'AAA', exScore: 3000, missCount: 2, source: 'eamusement', updatedAt: LATEST }),
            createRecord(3, { updatedAt: LATER }),
        ]
        const recent = getRecentRecords(charts, records, 5)

        expect(recent.map(({ chartId: id }) => id)).toEqual([chartId(1), chartId(3), chartId(2)])
        expect(recent[0]).toEqual({
            chartId: chartId(1),
            lamp: 'EX_HARD',
            scoreGrade: 'AAA',
            exScore: 3000,
            missCount: 2,
            source: 'eamusement',
            memo: '',
            updatedAt: LATEST,
            title: '첫 곡',
            difficulty: 'L',
            version: '32',
            normalRank: 'S',
            hardRank: 'A+',
        })
    })

    test('NO_PLAY 기록과 비활성 차트의 기록을 제외한다', () => {
        const records = [
            createRecord(1, { lamp: 'NO_PLAY', updatedAt: LATEST }),
            createRecord(INACTIVE_CHART_INDEX, { lamp: 'FULL_COMBO', updatedAt: LATEST }),
            createRecord(2, { updatedAt: EARLIER }),
        ]

        expect(getRecentRecords([createChart(1), createChart(2)], records, 5).map(({ chartId: id }) => id)).toEqual([chartId(2)])
    })

    test('갱신 시각이 같으면 높은 램프, 그다음 차트 id 순으로 입력 순서와 무관하게 정렬한다', () => {
        const charts = [1, 2, 3, 4].map((index) => createChart(index))
        const records = [
            createRecord(3, { lamp: 'CLEAR', updatedAt: LATER }),
            createRecord(1, { lamp: 'CLEAR', updatedAt: LATER }),
            createRecord(4, { lamp: 'FULL_COMBO', updatedAt: LATER }),
            createRecord(2, { lamp: 'HARD', updatedAt: LATER }),
        ]
        const expected = [chartId(4), chartId(2), chartId(1), chartId(3)]

        expect(getRecentRecords(charts, records, 4).map(({ chartId: id }) => id)).toEqual(expected)
        expect(getRecentRecords(charts.toReversed(), records.toReversed(), 4).map(({ chartId: id }) => id)).toEqual(expected)
    })

    test('밀리초 표기가 달라도 같은 시각으로 비교한다', () => {
        const records = [createRecord(1, { lamp: 'CLEAR', updatedAt: '2026-10-02T00:00:00Z' }), createRecord(2, { lamp: 'HARD', updatedAt: LATER })]

        expect(getRecentRecords([createChart(1), createChart(2)], records, 2).map(({ chartId: id }) => id)).toEqual([chartId(2), chartId(1)])
    })

    test('개수 인자만큼만 돌려주고 0 이하이면 빈 목록이다', () => {
        const charts = [1, 2, 3].map((index) => createChart(index))
        const records = [createRecord(1, { updatedAt: EARLIER }), createRecord(2, { updatedAt: LATER }), createRecord(3, { updatedAt: LATEST })]

        expect(getRecentRecords(charts, records, 2).map(({ chartId: id }) => id)).toEqual([chartId(3), chartId(2)])
        expect(getRecentRecords(charts, records, 0)).toEqual([])
        expect(getRecentRecords(charts, records, -1)).toEqual([])
    })

    test('입력 배열을 바꾸지 않는다', () => {
        const records = [createRecord(1, { updatedAt: EARLIER }), createRecord(2, { updatedAt: LATEST })]
        const snapshot = structuredClone(records)

        getRecentRecords([createChart(1), createChart(2)], records, 2)

        expect(records).toEqual(snapshot)
    })
})

describe('getScoreGradeDistribution', () => {
    test('기록이 없으면 AAA부터 F까지 모두 0이다', () => {
        expect(getScoreGradeDistribution([createChart(1)], [])).toEqual(SCORE_GRADES.toReversed().map((grade) => ({ grade, count: 0 })))
        expect(getScoreGradeDistribution([createChart(1)], [])[0]?.grade).toBe('AAA')
    })

    test('DJ 랭크별로 세고 DJ 랭크가 없는 기록과 비활성 차트의 기록은 세지 않는다', () => {
        const charts = [1, 2, 3, 4].map((index) => createChart(index))
        const records = [
            createRecord(1, { scoreGrade: 'AAA' }),
            createRecord(2, { scoreGrade: 'AA' }),
            createRecord(3, { scoreGrade: 'AA' }),
            createRecord(4, { scoreGrade: null }),
            createRecord(INACTIVE_CHART_INDEX, { scoreGrade: 'AAA' }),
        ]

        expect(getScoreGradeDistribution(charts, records).filter(({ count }) => count > 0)).toEqual([
            { grade: 'AAA', count: 1 },
            { grade: 'AA', count: 2 },
        ])
    })

    test('catalog가 비어 있으면 모두 0이다', () => {
        expect(getScoreGradeDistribution([], [createRecord(1, { scoreGrade: 'A' })]).every(({ count }) => count === 0)).toBe(true)
    })
})

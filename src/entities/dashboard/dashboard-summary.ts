import type { Chart } from '@entities/catalog/catalog.dto'
import { RANKS } from '@entities/catalog/catalog.dto'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { LAMPS, SCORE_GRADES } from '@entities/checker/checker.dto'

type Lamp = ChartRecord['lamp']

const UNPLAYED_LAMP = 'NO_PLAY' satisfies Lamp
const RANK_ORDER = [...RANKS.toReversed(), null]

const getLampByChartId = (records: ChartRecord[]) => new Map(records.map((record) => [record.chartId, record.lamp]))

const getRankSections = (charts: Chart[], lampByChartId: ReturnType<typeof getLampByChartId>, getRank: (chart: Chart) => Chart['normalRank']) =>
    RANK_ORDER.map((rank) => {
        const chartLamps = charts.filter((chart) => getRank(chart) === rank).map((chart) => lampByChartId.get(chart.id) ?? UNPLAYED_LAMP)

        return {
            rank,
            total: chartLamps.length,
            played: chartLamps.filter((chartLamp) => chartLamp !== UNPLAYED_LAMP).length,
            lamps: LAMPS.map((lamp) => ({ lamp, count: chartLamps.filter((chartLamp) => chartLamp === lamp).length })),
        }
    })

/**
 * Counts the charts of the current catalog by lamp. Charts without a record count as NO_PLAY and records of charts outside the catalog are ignored.
 * @param charts - charts of the current catalog
 * @param records - records of one user
 */
export const getLampSummary = (charts: Chart[], records: ChartRecord[]) => {
    const lampByChartId = getLampByChartId(records)
    const chartLamps = charts.map((chart) => lampByChartId.get(chart.id) ?? UNPLAYED_LAMP)

    return {
        total: charts.length,
        played: chartLamps.filter((chartLamp) => chartLamp !== UNPLAYED_LAMP).length,
        lamps: LAMPS.map((lamp) => ({ lamp, count: chartLamps.filter((chartLamp) => chartLamp === lamp).length })),
    }
}

/**
 * Counts the charts of each rank by lamp, from the highest rank down to unranked (null), grouped by the normal and the hard rank.
 * Charts without a record count as NO_PLAY, and a chart counts as played with any other lamp.
 * @param charts - charts of the current catalog
 * @param records - records of one user
 */
export const getRankLampDistribution = (charts: Chart[], records: ChartRecord[]) => {
    const lampByChartId = getLampByChartId(records)

    return {
        normal: getRankSections(charts, lampByChartId, (chart) => chart.normalRank),
        hard: getRankSections(charts, lampByChartId, (chart) => chart.hardRank),
    }
}

/**
 * Lists the most recently updated played records joined with their chart, newest first.
 * Records sharing a timestamp are ordered by the better lamp first and then by chart id.
 * @param charts - charts of the current catalog
 * @param records - records of one user
 * @param limit - maximum number of records to return
 */
export const getRecentRecords = (charts: Chart[], records: ChartRecord[], limit: number) => {
    const chartById = new Map(charts.map((chart) => [chart.id, chart]))

    return records
        .flatMap((record) => {
            const chart = chartById.get(record.chartId)

            return chart && record.lamp !== UNPLAYED_LAMP ? [{ record, chart }] : []
        })
        .toSorted(
            (first, second) =>
                Date.parse(second.record.updatedAt) - Date.parse(first.record.updatedAt) ||
                LAMPS.indexOf(second.record.lamp) - LAMPS.indexOf(first.record.lamp) ||
                first.record.chartId.localeCompare(second.record.chartId, 'en'),
        )
        .slice(0, Math.max(limit, 0))
        .map(({ record, chart }) => ({
            ...record,
            title: chart.title,
            difficulty: chart.difficulty,
            version: chart.version,
            normalRank: chart.normalRank,
            hardRank: chart.hardRank,
        }))
}

/**
 * Counts the records of the current catalog by DJ rank, from AAA down to F. Records without a DJ rank are not counted.
 * @param charts - charts of the current catalog
 * @param records - records of one user
 */
export const getScoreGradeDistribution = (charts: Chart[], records: ChartRecord[]) => {
    const chartIds = new Set(charts.map((chart) => chart.id))
    const scoreGrades = records.filter((record) => chartIds.has(record.chartId)).map((record) => record.scoreGrade)

    return SCORE_GRADES.toReversed().map((grade) => ({ grade, count: scoreGrades.filter((scoreGrade) => scoreGrade === grade).length }))
}

export type LampSummary = ReturnType<typeof getLampSummary>
export type RankLampDistribution = ReturnType<typeof getRankLampDistribution>
export type RankLampSection = RankLampDistribution['normal'][number]
export type RecentRecord = ReturnType<typeof getRecentRecords>[number]
export type ScoreGradeDistribution = ReturnType<typeof getScoreGradeDistribution>

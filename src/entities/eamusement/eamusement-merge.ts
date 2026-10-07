import type { ImportChart } from '@entities/eamusement/eamusement.dto'
import { NO_PLAY_LAMP } from '@entities/profile/profile.dto'
import { IMPORT_TARGET_LEVEL, IMPORT_UNMATCHED_LIMIT } from '@shared/constants/eamusement'
import type { UserRecordRow } from '@shared/server/db/checker-schema'

type CurrentRecord = Pick<UserRecordRow, 'chartId' | 'lamp' | 'scoreGrade' | 'exScore' | 'missCount' | 'updatedAt'>
type ImportChange = Omit<CurrentRecord, 'updatedAt'>

export const planImport = (currentRecords: CurrentRecord[], activeChartIds: ReadonlySet<string>, charts: ImportChart[], observedAt: string) => {
    const targetCharts = [...new Map(charts.filter((chart) => chart.level === IMPORT_TARGET_LEVEL).map((chart) => [chart.chartId, chart])).values()]
    const matchedCharts = targetCharts.filter((chart) => activeChartIds.has(chart.chartId))
    const currentByChartId = new Map(currentRecords.map((record) => [record.chartId, record]))
    const changes = matchedCharts.flatMap((chart) => {
        if (chart.lamp === NO_PLAY_LAMP) return []

        const current = currentByChartId.get(chart.chartId)

        if (current && current.updatedAt > observedAt) return []

        const next: ImportChange = {
            chartId: chart.chartId,
            lamp: chart.lamp,
            scoreGrade: chart.scoreGrade ?? current?.scoreGrade ?? null,
            exScore: chart.exScore ?? current?.exScore ?? null,
            missCount: chart.missCount ?? current?.missCount ?? null,
        }
        const isChanged =
            !current ||
            current.lamp !== next.lamp ||
            current.scoreGrade !== next.scoreGrade ||
            current.exScore !== next.exScore ||
            current.missCount !== next.missCount

        return isChanged ? [next] : []
    })
    const unmatched = targetCharts
        .filter((chart) => !activeChartIds.has(chart.chartId))
        .slice(0, IMPORT_UNMATCHED_LIMIT)
        .map(({ title, difficulty }) => ({ title, difficulty }))

    return { receivedCount: charts.length, matchedCount: matchedCharts.length, changedCount: changes.length, changes, unmatched }
}

import type { Chart } from '@entities/catalog/catalog.dto'
import { chartMatchKey } from '@entities/catalog/chart-title'
import type { ImportChart } from '@entities/eamusement/eamusement.dto'
import { NO_PLAY_LAMP } from '@entities/profile/profile.dto'
import { IMPORT_CHANGES_LIMIT, IMPORT_TARGET_LEVEL, IMPORT_UNMATCHED_LIMIT } from '@shared/constants/eamusement'
import type { UserRecordRow } from '@shared/server/db/checker-schema'

type CurrentRecord = Pick<UserRecordRow, 'chartId' | 'lamp' | 'scoreGrade' | 'exScore' | 'missCount' | 'updatedAt'>
type RecordValues = Omit<CurrentRecord, 'updatedAt'>
type PlannedChange = RecordValues & { previousLamp: CurrentRecord['lamp'] | null }
type CatalogChart = Pick<Chart, 'id' | 'title'> & { difficulty: string }

const indexByMatchKey = (catalog: readonly CatalogChart[]) => {
    const index = new Map<string, string | null>()

    for (const chart of catalog) {
        const key = chartMatchKey(chart.title, chart.difficulty)
        index.set(key, index.has(key) ? null : chart.id)
    }

    return index
}

export const planImport = (currentRecords: CurrentRecord[], catalog: readonly CatalogChart[], charts: ImportChart[], observedAt: string) => {
    const activeChartIds = new Set(catalog.map((chart) => chart.id))
    const chartIdsByMatchKey = indexByMatchKey(catalog)
    const matchedByChartId = new Map<string, ImportChart>()
    const unmatchedByChartId = new Map<string, ImportChart>()

    for (const chart of charts) {
        if (chart.level !== IMPORT_TARGET_LEVEL) continue

        const matchedChartId = activeChartIds.has(chart.chartId)
            ? chart.chartId
            : (chartIdsByMatchKey.get(chartMatchKey(chart.title, chart.difficulty)) ?? null)

        if (matchedChartId === null) {
            unmatchedByChartId.set(chart.chartId, chart)
            continue
        }

        matchedByChartId.set(matchedChartId, chart)
    }

    const currentByChartId = new Map(currentRecords.map((record) => [record.chartId, record]))
    const changes = [...matchedByChartId].flatMap(([chartId, chart]) => {
        if (chart.lamp === NO_PLAY_LAMP) return []

        const current = currentByChartId.get(chartId)

        if (current && current.updatedAt > observedAt) return []

        const next: RecordValues = {
            chartId,
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
        const change: PlannedChange = { ...next, previousLamp: current?.lamp ?? null }

        return isChanged ? [change] : []
    })
    const unmatched = [...unmatchedByChartId.values()].slice(0, IMPORT_UNMATCHED_LIMIT).map(({ title, difficulty }) => ({ title, difficulty }))

    return { receivedCount: charts.length, matchedCount: matchedByChartId.size, changedCount: changes.length, changes, unmatched }
}

export const summarizeImportChanges = (changes: ReturnType<typeof planImport>['changes']) =>
    changes
        .slice(0, IMPORT_CHANGES_LIMIT)
        .map(({ chartId, previousLamp, lamp, scoreGrade, exScore }) => ({ chartId, previousLamp, lamp, scoreGrade, exScore }))

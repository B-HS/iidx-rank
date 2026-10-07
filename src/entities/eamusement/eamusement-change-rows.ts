import type { Chart } from '@entities/catalog/catalog.dto'
import type { ImportResult } from '@entities/eamusement/eamusement.dto'

/**
 * Joins imported changes with the catalog. A chart that is missing from the catalog keeps its row with a null title and difficulty.
 * @param changes - changes returned by the import API
 * @param charts - catalog charts to resolve titles and difficulties from
 */
export const toImportChangeRows = (changes: ImportResult['changes'], charts: readonly Pick<Chart, 'id' | 'title' | 'difficulty'>[]) => {
    const chartById = new Map(charts.map((chart) => [chart.id, chart]))

    return changes.map((change) => {
        const chart = chartById.get(change.chartId)

        return { ...change, title: chart?.title ?? null, difficulty: chart?.difficulty ?? null }
    })
}

export type ImportChangeRow = ReturnType<typeof toImportChangeRows>[number]

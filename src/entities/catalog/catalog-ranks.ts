import type { Chart } from '@entities/catalog/catalog.dto'
import { RANKS } from '@entities/catalog/catalog.dto'

export const groupChartsByRank = (charts: Chart[], mode: 'normal' | 'hard') =>
    [...RANKS.toReversed(), null]
        .map((rank) => {
            const rankedCharts = charts.filter((chart) => (mode === 'normal' ? chart.normalRank : chart.hardRank) === rank)
            const isPersonal = (chart: Chart) => (mode === 'normal' ? chart.normalPersonal : chart.hardPersonal)
            return { rank, standardCharts: rankedCharts.filter((chart) => !isPersonal(chart)), personalCharts: rankedCharts.filter(isPersonal) }
        })
        .filter((section) => section.standardCharts.length + section.personalCharts.length > 0)

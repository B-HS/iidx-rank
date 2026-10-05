'use client'
import type { ComponentProps, FC } from 'react'
import type { Chart } from '@entities/catalog/catalog.dto'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { ChartCard } from '@features/chart-card-grid/chart-card'
import { CHART_CARD_GRID_CLASS_NAME, CHART_EMPTY_CELL_LAYOUTS } from '@shared/constants/checker'
import { cn } from '@shared/lib/utils'
import { Card } from '@shared/ui/card'

type Props = Pick<
    ComponentProps<typeof ChartCard>,
    'mode' | 'versionDisplay' | 'isRecordsPending' | 'isDisabled' | 'onAdvanceLamp' | 'onOpenDetails' | 'pendingLamp'
> & { charts: Chart[]; records: ReadonlyMap<string, ChartRecord>; label: string; pendingChartId: string | null }
export const ChartCardGrid: FC<Props> = ({ charts, records, label, pendingChartId, ...cardProps }) => (
    <ul aria-label={label} aria-busy={cardProps.isRecordsPending} className={CHART_CARD_GRID_CLASS_NAME}>
        {charts.map((chart) => (
            <li key={chart.id} className='min-w-0'>
                <ChartCard {...cardProps} chart={chart} record={records.get(chart.id)} isSaving={pendingChartId === chart.id} />
            </li>
        ))}
        {CHART_EMPTY_CELL_LAYOUTS.flatMap((layout) =>
            Array.from({ length: (layout.columns - (charts.length % layout.columns)) % layout.columns }, (_, index) => ({
                id: layout.columns + '-' + index,
                className: layout.className,
            })),
        ).map((cell) => (
            <li key={cell.id} aria-hidden='true' className={cell.className + ' min-w-0'}>
                <Card
                    className={cn(
                        'checker-chart-empty h-full rounded-none bg-card p-0 shadow-none ring-0',
                        cardProps.versionDisplay === 'logo' ? 'min-h-10' : 'min-h-14',
                    )}
                />
            </li>
        ))}
    </ul>
)

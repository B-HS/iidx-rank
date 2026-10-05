'use client'

import { type FC } from 'react'
import { type Chart } from '@entities/catalog/catalog.dto'
import { type Record as ChartRecord } from '@entities/checker/checker.dto'
import { ChartCardGrid } from '@features/chart-card-grid/chart-card-grid'
import { MESSAGES } from '@shared/messages/messages'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/card'

type Props = {
    rank: string
    isRecordsPending: boolean
    standardCharts: Chart[]
    personalCharts: Chart[]
    records: ReadonlyMap<string, ChartRecord>
    onOpenDetails: (chart: Chart) => void
}

export const ChartRankSection: FC<Props> = ({ rank, standardCharts, personalCharts, records, isRecordsPending, onOpenDetails }) => (
    <section aria-label={rank + MESSAGES.checker.rankSection} className='min-w-0'>
        <Card className='min-w-0 gap-px rounded-none bg-border p-0 shadow-none ring-0'>
            <CardHeader className='flex flex-row items-center justify-between bg-muted p-3'>
                <CardTitle>
                    <h2 className='text-sm font-semibold'>{rank}</h2>
                </CardTitle>
                <Badge variant='secondary' className='text-2xs'>
                    {MESSAGES.checker.resultCount(standardCharts.length + personalCharts.length)}
                </Badge>
            </CardHeader>
            <CardContent className='grid min-w-0 gap-px p-0'>
                {[
                    { key: 'standard', label: MESSAGES.checker.standardGroup, charts: standardCharts },
                    { key: 'personal', label: MESSAGES.checker.personalBadge, charts: personalCharts },
                ]
                    .filter((group) => group.charts.length > 0)
                    .map((group) => (
                        <div key={group.key} className='grid min-w-0 gap-px bg-border'>
                            <h3 className='flex items-center gap-2 bg-card px-3 py-1 text-2xs font-medium text-muted-foreground'>
                                {group.label}
                                <span className='tabular-nums'>{group.charts.length}</span>
                            </h3>
                            <ChartCardGrid
                                isRecordsPending={isRecordsPending}
                                charts={group.charts}
                                records={records}
                                label={rank + ' ' + group.label}
                                onOpenDetails={onOpenDetails}
                            />
                        </div>
                    ))}
            </CardContent>
        </Card>
    </section>
)

'use client'

import { type FC } from 'react'
import { type Chart } from '@entities/catalog/catalog.dto'
import { type Record as ChartRecord } from '@entities/checker/checker.dto'
import { MESSAGES } from '@shared/messages/messages'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent } from '@shared/ui/card'

type Props = {
    charts: Chart[]
    records: ReadonlyMap<string, ChartRecord>
    label: string
    onOpenDetails: (chart: Chart) => void
}

export const ChartCardGrid: FC<Props> = ({ charts, records, label, onOpenDetails }) => (
    <ul aria-label={label} className='grid min-w-0 grid-cols-3 gap-px bg-border sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'>
        {charts.map((chart) => {
            const lamp = records.get(chart.id)?.lamp ?? 'NO_PLAY'
            return (
                <li key={chart.id} className='min-w-0'>
                    <Card size='sm' className='h-full min-w-0 rounded-none bg-card p-0 shadow-none ring-0'>
                        <CardContent className='h-full min-w-0 p-1.5'>
                            <button
                                type='button'
                                title={chart.title}
                                onClick={() => onOpenDetails(chart)}
                                className='flex h-full w-full min-w-0 flex-col justify-between gap-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                                <span className='line-clamp-2 min-w-0 break-words text-2xs leading-tight font-medium'>{chart.title}</span>
                                <span className='flex min-w-0 items-center gap-1 text-2xs leading-tight text-muted-foreground'>
                                    <span className='shrink-0 font-medium text-foreground' title={MESSAGES.difficulty[chart.difficulty]}>
                                        {chart.difficulty}
                                    </span>
                                    <span className='min-w-0 flex-1 truncate'>{chart.version}</span>
                                    {lamp !== 'NO_PLAY' && (
                                        <Badge
                                            variant={lamp === 'FAILED' ? 'destructive' : 'secondary'}
                                            className='h-4 min-w-0 max-w-full truncate px-1 text-2xs leading-none'>
                                            {MESSAGES.lamp[lamp]}
                                        </Badge>
                                    )}
                                </span>
                            </button>
                        </CardContent>
                    </Card>
                </li>
            )
        })}
    </ul>
)

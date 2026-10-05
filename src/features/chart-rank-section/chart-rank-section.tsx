'use client'
import { type ComponentProps, type FC } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { type Chart } from '@entities/catalog/catalog.dto'
import { type Record as ChartRecord } from '@entities/checker/checker.dto'
import { ChartCardGrid } from '@features/chart-card-grid/chart-card-grid'
import { Badge } from '@shared/ui/badge'
import { Card, CardContent, CardHeader } from '@shared/ui/card'
import { Collapsible } from '@shared/ui/collapsible'
import { CollapsibleContent } from '@shared/ui/collapsible-content'
import { CollapsibleTrigger } from '@shared/ui/collapsible-trigger'
type Props = Pick<
    ComponentProps<typeof ChartCardGrid>,
    'mode' | 'versionDisplay' | 'isDisabled' | 'onAdvanceLamp' | 'pendingChartId' | 'pendingLamp'
> & {
    rank: string
    isRecordsPending: boolean
    standardCharts: Chart[]
    personalCharts: Chart[]
    records: ReadonlyMap<string, ChartRecord>
    onOpenDetails: (chart: Chart) => void
}
export const ChartRankSection: FC<Props> = ({ rank, standardCharts, personalCharts, records, isRecordsPending, onOpenDetails, ...cardProps }) => {
    const t = useTranslations()
    return (
        <Collapsible defaultOpen asChild>
            <section aria-label={rank + t('checker.rankSection')} className='min-w-0'>
                <Card className='min-w-0 gap-px rounded-none bg-border p-0 shadow-none ring-0'>
                    <CardHeader className='block bg-muted p-0'>
                        <h2>
                            <CollapsibleTrigger
                                className='group flex h-12 w-full items-center justify-between gap-2 p-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
                                aria-label={t('checker.toggleRankSection', { rank: rank })}>
                                <span className='flex min-w-0 items-center gap-2 text-sm font-semibold'>
                                    <ChevronDown className='size-4 shrink-0 transition-transform group-data-[state=closed]:-rotate-90' />
                                    {rank}
                                </span>
                                <Badge variant='secondary' className='text-2xs'>
                                    {t('checker.resultCount', { count: standardCharts.length + personalCharts.length })}
                                </Badge>
                            </CollapsibleTrigger>
                        </h2>
                    </CardHeader>
                    <CollapsibleContent asChild>
                        <CardContent className='grid min-w-0 gap-px p-0'>
                            {[
                                { key: 'standard', label: t('checker.standardGroup'), charts: standardCharts },
                                { key: 'personal', label: t('checker.personalBadge'), charts: personalCharts },
                            ]
                                .filter((group) => group.charts.length > 0)
                                .map((group) => (
                                    <div key={group.key} className='grid min-w-0 gap-px bg-border'>
                                        <h3 className='flex h-6 items-center gap-2 bg-card px-3 py-1 text-2xs font-medium text-muted-foreground'>
                                            {group.label}
                                            <span className='tabular-nums'>{group.charts.length}</span>
                                        </h3>
                                        <ChartCardGrid
                                            {...cardProps}
                                            isRecordsPending={isRecordsPending}
                                            charts={group.charts}
                                            records={records}
                                            label={rank + ' ' + group.label}
                                            onOpenDetails={onOpenDetails}
                                        />
                                    </div>
                                ))}
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </section>
        </Collapsible>
    )
}

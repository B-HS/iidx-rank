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
    onOpenDetails: (chart: Chart) => void
}

const LAMP_BADGE_VARIANTS = {
    NO_PLAY: 'outline',
    FAILED: 'destructive',
    ASSIST: 'secondary',
    EASY: 'secondary',
    CLEAR: 'secondary',
    HARD: 'secondary',
    EX_HARD: 'secondary',
    FULL_COMBO: 'secondary',
} as const satisfies Record<ChartRecord['lamp'], 'outline' | 'destructive' | 'secondary'>

export const ChartCardGrid: FC<Props> = ({ charts, records, onOpenDetails }) => (
    <ul aria-label={MESSAGES.checker.title} className='grid min-w-0 grid-cols-3 gap-px sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'>
        {charts.map((chart) => {
            const record = records.get(chart.id)
            const lamp = record?.lamp ?? 'NO_PLAY'
            const personalModes = [
                chart.normalPersonal ? MESSAGES.checker.normalMode : '',
                chart.hardPersonal ? MESSAGES.checker.hardMode : '',
            ].filter((mode) => mode !== '')

            return (
                <li key={chart.id} className='min-w-0'>
                    <Card size='sm' className='h-full min-w-0 rounded-none bg-card p-0 shadow-none ring-0'>
                        <CardContent className='min-w-0 p-1'>
                            <button
                                type='button'
                                title={chart.title}
                                onClick={() => onOpenDetails(chart)}
                                className='flex h-full min-h-0 w-full min-w-0 flex-col gap-1 rounded-none text-left outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                                <span className='line-clamp-2 min-w-0 break-words text-2xs leading-tight font-medium'>{chart.title}</span>
                                <span className='flex min-w-0 items-center gap-1 text-2xs leading-tight text-muted-foreground'>
                                    <span className='shrink-0 font-medium text-foreground' title={MESSAGES.difficulty[chart.difficulty]}>
                                        {chart.difficulty}
                                    </span>
                                    <span className='min-w-0 truncate'>{chart.version}</span>
                                </span>
                                <span className='grid min-w-0 grid-cols-2 gap-1 text-2xs leading-tight'>
                                    <span className='flex min-w-0 items-center gap-0.5'>
                                        <span className='shrink-0 text-muted-foreground'>{MESSAGES.checker.normalMode}</span>
                                        <span
                                            className={
                                                chart.normalPersonal
                                                    ? 'min-w-0 truncate font-medium text-destructive'
                                                    : 'min-w-0 truncate font-medium'
                                            }>
                                            {chart.normalRank ? MESSAGES.rank[chart.normalRank] : MESSAGES.checker.noRankShort}
                                        </span>
                                    </span>
                                    <span className='flex min-w-0 items-center gap-0.5'>
                                        <span className='shrink-0 text-muted-foreground'>{MESSAGES.checker.hardMode}</span>
                                        <span
                                            className={
                                                chart.hardPersonal ? 'min-w-0 truncate font-medium text-destructive' : 'min-w-0 truncate font-medium'
                                            }>
                                            {chart.hardRank ? MESSAGES.rank[chart.hardRank] : MESSAGES.checker.noRankShort}
                                        </span>
                                    </span>
                                </span>
                                <span className='flex min-w-0 items-center justify-between gap-1'>
                                    {personalModes.length > 0 ? (
                                        <Badge
                                            variant='secondary'
                                            title={personalModes.join(' · ')}
                                            className='h-4 max-w-full truncate px-1 text-2xs leading-none'>
                                            {MESSAGES.checker.personalBadge}
                                        </Badge>
                                    ) : (
                                        <span className='min-w-0' />
                                    )}
                                    <Badge variant={LAMP_BADGE_VARIANTS[lamp]} className='h-4 min-w-0 max-w-full truncate px-1 text-2xs leading-none'>
                                        <span className='truncate'>{MESSAGES.lamp[lamp]}</span>
                                    </Badge>
                                </span>
                            </button>
                        </CardContent>
                    </Card>
                </li>
            )
        })}
    </ul>
)

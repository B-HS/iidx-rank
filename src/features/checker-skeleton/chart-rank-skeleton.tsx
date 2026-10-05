import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { CHART_CARD_GRID_CLASS_NAME, CHART_EMPTY_CELL_LAYOUTS } from '@shared/constants/checker'
import { CHART_CARD_BODY_CLASS_NAMES } from '@shared/constants/display'
import { cn } from '@shared/lib/utils'
import { Card, CardContent, CardHeader } from '@shared/ui/card'
import { Skeleton } from '@shared/ui/skeleton'

type Props = { rank: string; standardCount: number; personalCount: number; versionDisplay: DisplayPreferencesInput['versionDisplay'] }
export const ChartRankSkeleton: FC<Props> = ({ rank, standardCount, personalCount, versionDisplay }) => {
    const t = useTranslations()
    return (
        <section aria-label={rank + t('checker.rankSection')} className='min-w-0'>
            <Card aria-hidden='true' className='min-w-0 gap-px overflow-visible rounded-none bg-border p-0 shadow-none ring-0'>
                <CardHeader className='checker-rank-header flex h-12 flex-row items-center justify-between bg-muted px-3 py-0'>
                    <Skeleton className='h-5 w-12' />
                    <Skeleton className='h-4 w-20' />
                </CardHeader>
                <CardContent className='grid min-w-0 gap-px p-0'>
                    {[
                        { id: 'standard', label: t('checker.standardGroup'), count: standardCount },
                        { id: 'personal', label: t('checker.personalBadge'), count: personalCount },
                    ]
                        .filter((group) => group.count > 0)
                        .map((group) => (
                            <div key={group.id} className='grid min-w-0 gap-px bg-border'>
                                <div className='flex h-6 items-center gap-2 bg-card px-3 py-0 text-2xs text-muted-foreground'>
                                    {group.label}
                                    <Skeleton className='h-3 w-6' />
                                </div>
                                <div className={CHART_CARD_GRID_CLASS_NAME}>
                                    {Array.from({ length: group.count }, (_, index) => group.id + '-' + index).map((id) => (
                                        <Card key={id} size='sm' className='checker-chart-empty min-w-0 rounded-none bg-card p-0 shadow-none ring-0'>
                                            <CardContent className='p-0'>
                                                <div
                                                    className={cn(
                                                        'flex min-w-0 flex-col justify-between gap-1 py-1.5 pr-1.5 pl-2',
                                                        CHART_CARD_BODY_CLASS_NAMES[versionDisplay],
                                                    )}>
                                                    <Skeleton className='h-3 w-4/5' />
                                                    <Skeleton className='h-3 w-3/5' />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    {CHART_EMPTY_CELL_LAYOUTS.flatMap((layout) =>
                                        Array.from({ length: (layout.columns - (group.count % layout.columns)) % layout.columns }, (_, index) => ({
                                            id: layout.columns + '-' + index,
                                            className: layout.className,
                                        })),
                                    ).map((cell) => (
                                        <Card
                                            key={cell.id}
                                            className={cn(cell.className, 'checker-chart-empty min-w-0 rounded-none bg-card p-0 shadow-none ring-0')}>
                                            <CardContent className='p-0'>
                                                <div className={CHART_CARD_BODY_CLASS_NAMES[versionDisplay]} />
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                </CardContent>
            </Card>
        </section>
    )
}

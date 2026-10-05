import { useTranslations } from 'next-intl'
import { SlidersHorizontal } from 'lucide-react'
import type { FC } from 'react'
import type { Catalog } from '@entities/catalog/catalog.dto'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { groupChartsByRank } from '@entities/catalog/catalog-ranks'
import { ChartRankSkeleton } from '@features/checker-skeleton/chart-rank-skeleton'
import { CheckerSidebarSkeleton } from '@features/checker-skeleton/checker-sidebar-skeleton'
import { Button } from '@shared/ui/button'
import { SidebarTrigger } from '@shared/ui/sidebar'
import { Skeleton } from '@shared/ui/skeleton'
import { AppShell } from '@widgets/app-shell/app-shell'

type Props = { catalog?: Catalog; versionDisplay?: DisplayPreferencesInput['versionDisplay'] }
export const CheckerLoading: FC<Props> = ({ catalog, versionDisplay }) => {
    const t = useTranslations()
    const sections = catalog ? groupChartsByRank(catalog.charts, 'normal') : []
    return (
        <AppShell sidebarContent={<CheckerSidebarSkeleton />}>
            <section aria-label={t('common.loading')} aria-busy='true' className='checker-workspace'>
                <span role='status' className='sr-only'>
                    {t('common.loading')}
                </span>
                <header className='checker-toolbar'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <SidebarTrigger aria-label={t('navigation.openSidebar')} className='shrink-0 md:hidden' />
                        <div className='min-w-0'>
                            <h1 className='truncate text-sm font-semibold'>
                                {t('checker.normalMode')} {t('checker.title')}
                            </h1>
                            <p className='hidden truncate text-xs text-muted-foreground sm:block'>{t('checker.description')}</p>
                        </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                        <div className='hidden h-4 w-24 text-right text-xs tabular-nums text-muted-foreground sm:block'>
                            {catalog ? t('checker.resultCount', { count: catalog.charts.length }) : <Skeleton className='h-4 w-full' />}
                        </div>
                        <Button disabled variant='ghost' size='icon-sm' aria-label={t('navigation.openFilters')}>
                            <SlidersHorizontal />
                        </Button>
                    </div>
                </header>
                <div className='checker-list-scroll'>
                    {versionDisplay ? (
                        <div className='grid min-w-0'>
                            {sections.map((section) => (
                                <ChartRankSkeleton
                                    key={section.rank ?? 'none'}
                                    rank={section.rank ?? t('checker.noRank')}
                                    standardCount={section.standardCharts.length}
                                    personalCount={section.personalCharts.length}
                                    versionDisplay={versionDisplay}
                                />
                            ))}
                        </div>
                    ) : (
                        <Skeleton aria-hidden='true' className='h-full min-h-[calc(100dvh-3rem)] w-full rounded-none' />
                    )}
                </div>
            </section>
        </AppShell>
    )
}

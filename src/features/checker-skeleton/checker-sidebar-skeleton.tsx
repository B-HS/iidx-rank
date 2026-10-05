import { useTranslations } from 'next-intl'
import type { FC } from 'react'
import { CheckerRecordsSkeleton } from '@features/checker-skeleton/checker-records-skeleton'
import { Skeleton } from '@shared/ui/skeleton'

const SOURCE_FIELD_IDS = ['updated', 'fetched', 'count'] as const
export const CheckerSidebarSkeleton: FC = () => {
    const t = useTranslations()
    return (
        <div aria-label={t('checker.loadingSidebar')} aria-busy='true' className='grid min-w-0 gap-px bg-border'>
            <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
                <h2 className='checker-micro-label'>{t('checker.sourceTitle')}</h2>
                <Skeleton className='h-8 w-full' />
                <div className='grid gap-2'>
                    {SOURCE_FIELD_IDS.map((id) => (
                        <div key={id} className='flex h-8 items-start justify-between gap-2'>
                            <Skeleton className='h-3 w-16' />
                            <Skeleton className='h-6 w-24' />
                        </div>
                    ))}
                </div>
                <div className='grid h-8 grid-cols-2 gap-1'>
                    <Skeleton className='h-8 w-full' />
                    <span />
                </div>
            </section>
            <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
                <h2 className='checker-micro-label'>{t('checker.summaryTitle')}</h2>
                <div className='h-20'>
                    <CheckerRecordsSkeleton />
                </div>
                <div className='flex h-4 items-center justify-between gap-2'>
                    <Skeleton className='h-3 w-24' />
                    <Skeleton className='h-3 w-6' />
                </div>
            </section>
        </div>
    )
}

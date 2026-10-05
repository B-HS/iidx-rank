import { type FC } from 'react'

import { CheckerRecordsSkeleton } from '@features/checker-skeleton/checker-records-skeleton'
import { MESSAGES } from '@shared/messages/messages'
import { Skeleton } from '@shared/ui/skeleton'

const FILTER_IDS = ['search', 'difficulty', 'version', 'rank'] as const
const CHECKBOX_IDS = ['personal', 'unplayed'] as const
const SOURCE_FIELD_IDS = ['updated', 'fetched', 'count'] as const

export const CheckerSidebarSkeleton: FC = () => (
    <div aria-label={MESSAGES.checker.loadingFilters} aria-busy='true' className='grid min-w-0 gap-px bg-border'>
        <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
            <h2 className='checker-micro-label'>{MESSAGES.checker.filtersTitle}</h2>
            <div aria-hidden='true' className='grid gap-5'>
                <div className='grid gap-2'>
                    <Skeleton className='h-3 w-8 bg-sidebar-accent' />
                    <Skeleton className='h-7 w-full bg-sidebar-accent' />
                </div>
                <div className='grid gap-4'>
                    {FILTER_IDS.map((id) => (
                        <div key={id} className='grid gap-1.5'>
                            <Skeleton className='h-3 w-16 bg-sidebar-accent' />
                            <Skeleton className='h-9 w-full bg-sidebar-accent' />
                        </div>
                    ))}
                </div>
                <div className='grid gap-3 border-t border-border pt-4'>
                    {CHECKBOX_IDS.map((id) => (
                        <div key={id} className='flex items-center gap-2'>
                            <Skeleton className='size-4 bg-sidebar-accent' />
                            <Skeleton className='h-4 w-28 bg-sidebar-accent' />
                        </div>
                    ))}
                </div>
                <Skeleton className='h-3 w-36 bg-sidebar-accent' />
            </div>
        </section>
        <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
            <h2 className='checker-micro-label'>{MESSAGES.display.title}</h2>
            <Skeleton className='h-8 w-full bg-sidebar-accent' />
            <Skeleton className='h-4 w-full bg-sidebar-accent' />
        </section>
        <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
            <h2 className='checker-micro-label'>{MESSAGES.checker.sourceTitle}</h2>
            <div aria-hidden='true' className='grid gap-3'>
                <Skeleton className='h-3 w-36 bg-sidebar-accent' />
                {SOURCE_FIELD_IDS.map((id) => (
                    <div key={id} className='flex justify-between gap-2'>
                        <Skeleton className='h-3 w-16 bg-sidebar-accent' />
                        <Skeleton className='h-3 w-24 bg-sidebar-accent' />
                    </div>
                ))}
                <Skeleton className='h-8 w-1/2 bg-sidebar-accent' />
            </div>
        </section>
        <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
            <h2 className='checker-micro-label'>{MESSAGES.checker.summaryTitle}</h2>
            <CheckerRecordsSkeleton />
        </section>
    </div>
)

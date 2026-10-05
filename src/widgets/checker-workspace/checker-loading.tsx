import { type FC } from 'react'

import { ChartRankSkeleton } from '@features/checker-skeleton/chart-rank-skeleton'
import { CheckerSidebarSkeleton } from '@features/checker-skeleton/checker-sidebar-skeleton'
import { CHECKER_SKELETON_SECTION_IDS } from '@shared/constants/checker'
import { MESSAGES } from '@shared/messages/messages'
import { SidebarTrigger } from '@shared/ui/sidebar'
import { Skeleton } from '@shared/ui/skeleton'
import { AppShell } from '@widgets/app-shell/app-shell'

type Props = {
    label: string
}

export const CheckerLoading: FC<Props> = ({ label }) => (
    <AppShell sidebarContent={<CheckerSidebarSkeleton />}>
        <section aria-label={label} aria-busy='true' className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            <span role='status' className='sr-only'>
                {label}
            </span>
            <header className='flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-3'>
                <div className='flex min-w-0 items-center gap-2'>
                    <SidebarTrigger aria-label={MESSAGES.navigation.openSidebar} className='shrink-0 md:hidden' />
                    <div aria-hidden='true' className='grid min-w-0 gap-1'>
                        <Skeleton className='h-4 w-48 max-w-full' />
                        <Skeleton className='hidden h-3 w-64 max-w-full sm:block' />
                    </div>
                </div>
                <div aria-hidden='true' className='flex shrink-0 items-center gap-1'>
                    <Skeleton className='hidden h-4 w-20 sm:block' />
                    <Skeleton className='size-8' />
                </div>
            </header>
            <div className='checker-list-scroll grid min-h-0 flex-1 content-start overflow-auto p-0'>
                {CHECKER_SKELETON_SECTION_IDS.map((id) => (
                    <ChartRankSkeleton key={id} />
                ))}
            </div>
        </section>
    </AppShell>
)

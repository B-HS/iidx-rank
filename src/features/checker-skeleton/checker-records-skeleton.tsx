import { type FC } from 'react'

import { MESSAGES } from '@shared/messages/messages'
import { Skeleton } from '@shared/ui/skeleton'

export const CheckerRecordsSkeleton: FC = () => (
    <div role='status' aria-label={MESSAGES.checker.loadingRecords} aria-busy='true' className='grid gap-3'>
        <span className='sr-only'>{MESSAGES.checker.loadingRecords}</span>
        <div aria-hidden='true' className='grid gap-3'>
            <Skeleton className='h-3 w-full bg-sidebar-accent' />
            <div className='flex items-center justify-between gap-2'>
                <Skeleton className='h-3 w-24 bg-sidebar-accent' />
                <Skeleton className='h-3 w-16 bg-sidebar-accent' />
            </div>
            <Skeleton className='h-2 w-full bg-sidebar-accent' />
        </div>
    </div>
)

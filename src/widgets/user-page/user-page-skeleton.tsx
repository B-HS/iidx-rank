import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

export const UserPageSkeleton: FC = () => {
    const t = useTranslations('profile')

    return (
        <div role='status' aria-label={t('loading')} aria-busy='true' className='min-w-0'>
            <div className='flex min-w-0 items-start gap-3 border-b border-border p-3'>
                <Skeleton className='size-16 shrink-0 rounded-full sm:size-20' />
                <div className='grid min-w-0 flex-1 gap-2'>
                    <Skeleton className='h-6 w-40 max-w-full' />
                    <Skeleton className='h-4 w-64 max-w-full' />
                    <Skeleton className='h-4 w-full max-w-md' />
                </div>
            </div>
            <div className='grid min-w-0 gap-2 p-3'>
                <Skeleton className='h-8 w-40' />
                <Skeleton className='h-24 w-full max-w-xl' />
            </div>
        </div>
    )
}

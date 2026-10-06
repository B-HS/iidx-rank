import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

export const BoardPostSkeleton: FC = () => {
    const t = useTranslations('board')

    return (
        <div role='status' aria-label={t('postLoading')} aria-busy='true' className='min-w-0'>
            <div className='grid min-w-0 gap-2 border-b border-border p-3'>
                <Skeleton className='h-6 w-full max-w-md' />
                <Skeleton className='h-4 w-56 max-w-full' />
            </div>
            <div className='grid min-w-0 gap-2 p-3'>
                <Skeleton className='h-4 w-full max-w-2xl' />
                <Skeleton className='h-4 w-full max-w-xl' />
                <Skeleton className='h-4 w-full max-w-lg' />
            </div>
        </div>
    )
}

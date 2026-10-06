import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

const SKELETON_ROW_IDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const

export const UserListSkeleton: FC = () => {
    const t = useTranslations('social')

    return (
        <div role='status' aria-label={t('usersLoading')} aria-busy='true' className='min-w-0'>
            {SKELETON_ROW_IDS.map((id) => (
                <div key={id} className='flex min-w-0 items-center gap-3 border-b border-border px-3 py-2'>
                    <Skeleton className='size-8 shrink-0 rounded-full' />
                    <div className='grid min-w-0 flex-1 gap-1.5'>
                        <Skeleton className='h-4 w-40 max-w-full' />
                        <Skeleton className='h-3 w-24 max-w-full' />
                    </div>
                    <Skeleton className='h-3 w-28 shrink-0' />
                </div>
            ))}
        </div>
    )
}

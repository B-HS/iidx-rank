import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

const SKELETON_ROW_IDS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'] as const

export const BoardListSkeleton: FC = () => {
    const t = useTranslations('board')

    return (
        <div role='status' aria-label={t('listLoading')} aria-busy='true' className='min-w-0'>
            {SKELETON_ROW_IDS.map((id) => (
                <div key={id} className='flex min-w-0 flex-col gap-2 border-b border-border px-3 py-2.5 sm:flex-row sm:items-center sm:gap-3'>
                    <Skeleton className='h-4 w-full max-w-md sm:flex-1' />
                    <Skeleton className='h-3 w-40 shrink-0' />
                </div>
            ))}
        </div>
    )
}

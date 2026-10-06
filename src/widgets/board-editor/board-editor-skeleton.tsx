import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

export const BoardEditorSkeleton: FC = () => {
    const t = useTranslations('board')

    return (
        <div role='status' aria-label={t('editorLoading')} aria-busy='true' className='grid w-full max-w-3xl min-w-0 gap-4 p-3'>
            <Skeleton className='h-8 w-full' />
            <Skeleton className='h-64 w-full' />
            <Skeleton className='h-7 w-32' />
        </div>
    )
}

import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@shared/ui/button'
import { Skeleton } from '@shared/ui/skeleton'

type ProfileRecordsStatusProps = {
    isError: boolean
    isRetrying: boolean
    onRetry: () => void
}

export const ProfileRecordsStatus: FC<ProfileRecordsStatusProps> = ({ isError, isRetrying, onRetry }) => {
    const t = useTranslations()

    if (isError) {
        return (
            <div className='flex min-w-0 flex-wrap items-center gap-2 p-3'>
                <p role='alert' className='text-sm text-muted-foreground'>
                    {t('profile.recordsLoadError')}
                </p>
                <Button variant='outline' size='sm' disabled={isRetrying} onClick={onRetry}>
                    {t('common.retry')}
                </Button>
            </div>
        )
    }

    return (
        <div role='status' aria-label={t('profile.recordsLoading')} aria-busy='true' className='grid min-w-0 gap-2 p-3'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full max-w-xl' />
            <Skeleton className='h-10 w-full max-w-xl' />
        </div>
    )
}

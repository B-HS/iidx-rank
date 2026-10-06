import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

type ProfileRecordsStatusProps = {
    isError: boolean
}

export const ProfileRecordsStatus: FC<ProfileRecordsStatusProps> = ({ isError }) => {
    const t = useTranslations('profile')

    if (isError) {
        return (
            <p role='alert' className='p-3 text-sm text-muted-foreground'>
                {t('recordsLoadError')}
            </p>
        )
    }

    return (
        <div role='status' aria-label={t('recordsLoading')} aria-busy='true' className='grid min-w-0 gap-2 p-3'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full max-w-xl' />
            <Skeleton className='h-10 w-full max-w-xl' />
        </div>
    )
}

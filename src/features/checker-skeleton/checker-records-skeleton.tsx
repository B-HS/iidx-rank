import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'
export const CheckerRecordsSkeleton: FC = () => {
    const t = useTranslations()
    return (
        <div role='status' aria-label={t('checker.loadingRecords')} aria-busy='true' className='grid gap-3'>
            <span className='sr-only'>{t('checker.loadingRecords')}</span>
            <div aria-hidden='true' className='grid gap-3'>
                <div className='h-8'>
                    <Skeleton className='h-3 w-full bg-sidebar-accent' />
                </div>
                <div className='flex h-4 items-center justify-between gap-2'>
                    <Skeleton className='h-3 w-24 bg-sidebar-accent' />
                    <Skeleton className='h-3 w-16 bg-sidebar-accent' />
                </div>
                <Skeleton className='h-2 w-full bg-sidebar-accent' />
            </div>
        </div>
    )
}

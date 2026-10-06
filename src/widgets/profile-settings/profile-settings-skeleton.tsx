import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@shared/ui/skeleton'

const FIELD_SKELETON_IDS = ['name', 'handle', 'bio'] as const

export const ProfileSettingsSkeleton: FC = () => {
    const t = useTranslations('settings')

    return (
        <div role='status' aria-label={t('loading')} aria-busy='true' className='grid min-w-0 gap-4 p-3'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='size-16 rounded-full' />
            {FIELD_SKELETON_IDS.map((id) => (
                <div key={id} className='grid max-w-xl gap-2'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-8 w-full' />
                </div>
            ))}
        </div>
    )
}

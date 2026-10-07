import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { DASHBOARD_GRID_CLASS_NAME, DASHBOARD_PANEL_SKELETON_CLASS_NAME, DASHBOARD_WIDE_PANEL_CLASS_NAME } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'
import { Skeleton } from '@shared/ui/skeleton'

const SKELETON_PANELS = [
    { id: 'profile', isWide: false },
    { id: 'radar', isWide: false },
    { id: 'lamp', isWide: false },
    { id: 'rank', isWide: false },
    { id: 'recent', isWide: true },
    { id: 'board', isWide: true },
] as const

export const HomeDashboardSkeleton: FC = () => {
    const t = useTranslations('home')

    return (
        <div role='status' aria-label={t('loading')} aria-busy='true' className={DASHBOARD_GRID_CLASS_NAME}>
            {SKELETON_PANELS.map(({ id, isWide }) => (
                <div
                    key={id}
                    aria-hidden='true'
                    className={cn('flex min-w-0 flex-col bg-card', DASHBOARD_PANEL_SKELETON_CLASS_NAME, isWide && DASHBOARD_WIDE_PANEL_CLASS_NAME)}>
                    <div className='flex h-9 shrink-0 items-center px-3'>
                        <Skeleton className='h-4 w-24' />
                    </div>
                    <div className='flex min-h-0 flex-1 flex-col px-3 pb-3'>
                        <Skeleton className='min-h-0 flex-1' />
                    </div>
                </div>
            ))}
        </div>
    )
}

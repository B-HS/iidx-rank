'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useRecentUsers } from '@entities/profile/profile.query'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Link } from '@shared/i18n/navigation'
import { Skeleton } from '@shared/ui/skeleton'

const SKELETON_ROW_IDS = ['first', 'second', 'third'] as const

export const RecentUsers: FC = () => {
    const t = useTranslations('social')
    const recentUsersQuery = useRecentUsers()
    const users = recentUsersQuery.data?.users

    return (
        <section className='grid min-w-0 gap-1 border-y border-border py-3'>
            <h2 className='checker-micro-label px-3'>{t('recentUsersTitle')}</h2>
            {!users && recentUsersQuery.isError && <p className='px-3 text-xs text-muted-foreground'>{t('recentUsersError')}</p>}
            {!users && !recentUsersQuery.isError && (
                <div role='status' aria-label={t('recentUsersLoading')} aria-busy='true' className='grid min-w-0 gap-2 px-3 py-1'>
                    {SKELETON_ROW_IDS.map((id) => (
                        <div key={id} className='flex min-w-0 items-center gap-2'>
                            <Skeleton className='size-6 shrink-0 rounded-full' />
                            <Skeleton className='h-3 min-w-0 flex-1' />
                        </div>
                    ))}
                </div>
            )}
            {users?.length === 0 && <p className='px-3 text-xs text-muted-foreground'>{t('recentUsersEmpty')}</p>}
            {users && users.length > 0 && (
                <ul className='grid min-w-0'>
                    {users.map((user) => (
                        <li key={user.handle} className='min-w-0'>
                            <Link
                                href={`/u/${user.handle}`}
                                className='flex h-8 min-w-0 items-center gap-2 px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-inset hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:bg-sidebar-accent focus-visible:text-sidebar-accent-foreground'>
                                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className='size-6 [&_[data-slot=avatar-fallback]]:text-xs' />
                                <span className='min-w-0 truncate'>{user.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

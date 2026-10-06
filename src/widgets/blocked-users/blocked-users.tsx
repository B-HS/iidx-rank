'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { authClient } from '@entities/auth/auth.api'
import { useBlockedUsers, useUnblockUser } from '@entities/block/block.query'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Button } from '@shared/ui/button'
import { Skeleton } from '@shared/ui/skeleton'

const SKELETON_ROW_IDS = ['first', 'second'] as const

export const BlockedUsers: FC = () => {
    const t = useTranslations()
    const { data: session } = authClient.useSession()
    const blockedUsersQuery = useBlockedUsers(Boolean(session?.user))
    const unblockUser = useUnblockUser()
    const users = blockedUsersQuery.data?.users

    if (!users && blockedUsersQuery.isError) {
        return (
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <p className='text-sm text-muted-foreground'>{t('board.blockedLoadError')}</p>
                <Button variant='outline' size='sm' disabled={blockedUsersQuery.isFetching} onClick={() => void blockedUsersQuery.refetch()}>
                    {t('common.retry')}
                </Button>
            </div>
        )
    }

    if (!users) {
        return (
            <div role='status' aria-label={t('board.blockedLoading')} aria-busy='true' className='grid max-w-xl min-w-0 gap-2'>
                {SKELETON_ROW_IDS.map((id) => (
                    <div key={id} className='flex min-w-0 items-center gap-2'>
                        <Skeleton className='size-8 shrink-0 rounded-full' />
                        <Skeleton className='h-4 min-w-0 flex-1' />
                        <Skeleton className='h-7 w-20 shrink-0' />
                    </div>
                ))}
            </div>
        )
    }

    if (users.length === 0) return <p className='text-sm text-muted-foreground'>{t('board.blockedEmpty')}</p>

    return (
        <ul className='grid max-w-xl min-w-0 border-t border-border'>
            {users.map((user) => (
                <li key={user.handle} className='flex min-w-0 items-center gap-2 border-b border-border py-2'>
                    <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
                    <div className='grid min-w-0 flex-1'>
                        <span className='truncate text-sm font-medium'>{user.name}</span>
                        <span className='truncate text-xs text-muted-foreground'>@{user.handle}</span>
                    </div>
                    <Button
                        variant='outline'
                        size='sm'
                        className='shrink-0'
                        disabled={unblockUser.isPending && unblockUser.variables === user.handle}
                        onClick={() => unblockUser.mutate(user.handle)}>
                        {t('board.unblock')}
                    </Button>
                </li>
            ))}
        </ul>
    )
}

'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { getProfilePathname, getUserListPathname, USERS_PATHNAME } from '@entities/profile/profile-page'
import { useUserList } from '@entities/profile/profile.query'
import { BoardPagination } from '@features/board-pagination/board-pagination'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { UserListSkeleton } from '@widgets/user-list/user-list-skeleton'

type UserListProps = {
    page: number
}

const FIRST_PAGE = 1

export const UserList: FC<UserListProps> = ({ page }) => {
    const t = useTranslations()
    const userListQuery = useUserList(page)
    const userList = userListQuery.data

    return (
        <BoardFrame title={t('navigation.users')}>
            <p className='border-b border-border px-3 py-2 text-xs text-muted-foreground'>{t('social.usersDescription')}</p>
            {!userList && userListQuery.isError && (
                <Empty className='min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('social.usersLoadErrorTitle')}</EmptyTitle>
                        <EmptyDescription>{t('social.usersLoadErrorDescription')}</EmptyDescription>
                    </EmptyHeader>
                    <Button variant='outline' size='sm' disabled={userListQuery.isFetching} onClick={() => void userListQuery.refetch()}>
                        {t('common.retry')}
                    </Button>
                </Empty>
            )}
            {!userList && !userListQuery.isError && <UserListSkeleton />}
            {userList && userList.users.length > 0 && (
                <ul className='min-w-0'>
                    {userList.users.map((user) => (
                        <li key={user.handle} className='relative flex min-w-0 items-center gap-3 border-b border-border px-3 py-2 hover:bg-muted/50'>
                            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className='shrink-0' />
                            <div className='grid min-w-0 flex-1'>
                                <Link
                                    href={getProfilePathname(user.handle)}
                                    className='min-w-0 truncate text-sm font-medium outline-none after:absolute after:inset-0 hover:underline focus-visible:underline focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:ring-inset'>
                                    {user.name}
                                </Link>
                                <span className='min-w-0 truncate text-xs text-muted-foreground'>@{user.handle}</span>
                            </div>
                            <span className='flex shrink-0 flex-col items-end text-xs text-muted-foreground sm:flex-row sm:gap-1.5'>
                                <span>{t('social.usersUpdatedAt')}</span>
                                <BoardTimestamp value={user.updatedAt} className='whitespace-nowrap tabular-nums' />
                            </span>
                        </li>
                    ))}
                </ul>
            )}
            {userList && userList.users.length === 0 && (
                <Empty className='min-h-48 flex-none border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{page > FIRST_PAGE ? t('social.usersPageEmptyTitle') : t('social.usersEmptyTitle')}</EmptyTitle>
                        <EmptyDescription>
                            {page > FIRST_PAGE ? t('social.usersPageEmptyDescription') : t('social.usersEmptyDescription')}
                        </EmptyDescription>
                    </EmptyHeader>
                    {page > FIRST_PAGE && (
                        <Button variant='outline' size='sm' asChild>
                            <Link href={USERS_PATHNAME}>{t('social.usersFirstPage')}</Link>
                        </Button>
                    )}
                </Empty>
            )}
            {userList && (
                <BoardPagination
                    page={page}
                    totalPages={userList.pagination.totalPages}
                    label={t('social.usersPaginationLabel')}
                    className='p-3'
                    getHref={getUserListPathname}
                />
            )}
        </BoardFrame>
    )
}

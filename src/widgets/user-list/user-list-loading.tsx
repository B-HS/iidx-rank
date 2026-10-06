import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { UserListSkeleton } from '@widgets/user-list/user-list-skeleton'

export const UserListLoading: FC = () => {
    const t = useTranslations('navigation')

    return (
        <BoardFrame title={t('users')}>
            <UserListSkeleton />
        </BoardFrame>
    )
}

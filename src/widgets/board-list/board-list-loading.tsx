import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListSkeleton } from '@widgets/board-list/board-list-skeleton'

export const BoardListLoading: FC = () => {
    const t = useTranslations('navigation')

    return (
        <BoardFrame title={t('board')}>
            <BoardListSkeleton />
        </BoardFrame>
    )
}

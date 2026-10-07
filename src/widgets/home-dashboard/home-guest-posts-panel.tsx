'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { BOARD_PATHNAME } from '@entities/board/board-page'
import { useBoardPosts } from '@entities/board/board.query'
import { DashboardPostRow } from '@features/dashboard-activity/dashboard-post-row'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'
import { FittedRowList } from '@features/fitted-row-list/fitted-row-list'
import { DASHBOARD_BOARD_PAGE, DASHBOARD_WIDE_PANEL_CLASS_NAME } from '@shared/constants/dashboard'

type HomeGuestPostsPanelProps = {
    kind: 'notices' | 'posts'
}

const PANEL_MESSAGE_KEYS = {
    notices: { title: 'board.noticesHeading', empty: 'home.noticesEmpty' },
    posts: { title: 'home.recentPostsTitle', empty: 'board.listEmptyTitle' },
} as const

export const HomeGuestPostsPanel: FC<HomeGuestPostsPanelProps> = ({ kind }) => {
    const t = useTranslations()
    const postsQuery = useBoardPosts(DASHBOARD_BOARD_PAGE)
    const posts = postsQuery.data?.[kind]
    const isFailed = !posts && postsQuery.isError
    const title = t(PANEL_MESSAGE_KEYS[kind].title)

    return (
        <DashboardPanel
            title={title}
            className={DASHBOARD_WIDE_PANEL_CLASS_NAME}
            bodyClassName='p-0'
            actions={<DashboardPanelLink href={BOARD_PATHNAME}>{t('navigation.board')}</DashboardPanelLink>}>
            {isFailed && (
                <DashboardPanelError
                    message={t('board.listLoadErrorTitle')}
                    isRetrying={postsQuery.isFetching}
                    onRetry={() => void postsQuery.refetch()}
                />
            )}
            {!isFailed && !posts && <DashboardPanelLoading label={t('board.listLoading')} className='mx-3 mb-3' />}
            {posts && posts.length === 0 && <DashboardPanelEmpty message={t(PANEL_MESSAGE_KEYS[kind].empty)} />}
            {posts && posts.length > 0 && (
                <FittedRowList
                    label={title}
                    className='flex-1 border-t border-border'
                    rowClassName='h-8 border-b border-border'
                    rows={posts.map((post) => ({
                        id: post.id,
                        content: <DashboardPostRow post={post} authorName={kind === 'posts' ? post.author.name : undefined} />,
                    }))}
                />
            )}
        </DashboardPanel>
    )
}

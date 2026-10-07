'use client'
import type { FC } from 'react'
import { CheckCheck, List, PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BOARD_PATHNAME } from '@entities/board/board-page'
import type { MyPostComment } from '@entities/board/board.dto'
import { useMyBoardActivity } from '@entities/board/board.query'
import { saveCommentsSeen, useCommentsSeen } from '@entities/dashboard/comments-seen.client'
import { isCommentUnseen, markAllCommentsSeen, markCommentsSeen } from '@entities/dashboard/comments-seen.dto'
import { DashboardCommentRow } from '@features/dashboard-activity/dashboard-comment-row'
import { DashboardPostRow } from '@features/dashboard-activity/dashboard-post-row'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'
import { FittedRowList } from '@features/fitted-row-list/fitted-row-list'
import { DASHBOARD_SPLIT_CLASS_NAME, DASHBOARD_SPLIT_SECTION_CLASS_NAMES, DASHBOARD_WIDE_PANEL_CLASS_NAME } from '@shared/constants/dashboard'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'

type HomeBoardPanelProps = {
    userId: string
}

const BOARD_WRITE_PATHNAME = `${BOARD_PATHNAME}/new`
const SECTION_HEADING_CLASS_NAME = 'checker-micro-label flex h-6 shrink-0 items-center border-b border-border px-3'

export const HomeBoardPanel: FC<HomeBoardPanelProps> = ({ userId }) => {
    const t = useTranslations()
    const activityQuery = useMyBoardActivity(true)
    const seen = useCommentsSeen(userId)
    const activity = activityQuery.data
    const comments = activity?.comments ?? []
    const newCommentIds = comments.filter((comment) => isCommentUnseen(seen, comment)).map((comment) => comment.id)
    const isFailed = !activity && activityQuery.isError
    const handleOpenComment = (comment: MyPostComment) =>
        saveCommentsSeen(
            userId,
            markCommentsSeen(
                seen,
                comments.filter((item) => item.postId === comment.postId),
            ),
        )

    return (
        <DashboardPanel
            title={t('home.boardTitle')}
            className={DASHBOARD_WIDE_PANEL_CLASS_NAME}
            bodyClassName='p-0'
            badge={
                newCommentIds.length > 0 && <Badge className='h-4 px-1.5 text-2xs'>{t('home.newComments', { count: newCommentIds.length })}</Badge>
            }
            actions={
                <>
                    {newCommentIds.length > 0 && (
                        <Button variant='ghost' size='xs' onClick={() => saveCommentsSeen(userId, markAllCommentsSeen(seen, comments))}>
                            <CheckCheck aria-hidden='true' />
                            {t('home.markAllSeen')}
                        </Button>
                    )}
                    <DashboardPanelLink href={BOARD_WRITE_PATHNAME} size='icon-xs' aria-label={t('board.write')} title={t('board.write')}>
                        <PenLine aria-hidden='true' />
                    </DashboardPanelLink>
                    <DashboardPanelLink href={BOARD_PATHNAME} size='icon-xs' aria-label={t('navigation.board')} title={t('navigation.board')}>
                        <List aria-hidden='true' />
                    </DashboardPanelLink>
                </>
            }>
            {isFailed && (
                <DashboardPanelError
                    message={t('home.boardLoadError')}
                    isRetrying={activityQuery.isFetching}
                    onRetry={() => void activityQuery.refetch()}
                />
            )}
            {!isFailed && !activity && <DashboardPanelLoading label={t('home.boardLoading')} className='mx-3 mb-3' />}
            {activity && (
                <div className='@container/split flex min-h-0 min-w-0 flex-1 flex-col border-t border-border'>
                    <div className={DASHBOARD_SPLIT_CLASS_NAME}>
                        <section className={DASHBOARD_SPLIT_SECTION_CLASS_NAMES.minor}>
                            <h3 className={SECTION_HEADING_CLASS_NAME}>{t('home.myPostsTitle')}</h3>
                            {activity.posts.length === 0 ? (
                                <DashboardPanelEmpty message={t('home.myPostsEmpty')}>
                                    <DashboardPanelLink href={BOARD_WRITE_PATHNAME} variant='outline'>
                                        <PenLine aria-hidden='true' />
                                        {t('board.write')}
                                    </DashboardPanelLink>
                                </DashboardPanelEmpty>
                            ) : (
                                <FittedRowList
                                    label={t('home.myPostsTitle')}
                                    className='flex-1'
                                    rowClassName='h-7 border-b border-border'
                                    rows={activity.posts.map((post) => ({ id: post.id, content: <DashboardPostRow post={post} /> }))}
                                />
                            )}
                        </section>
                        <section className={DASHBOARD_SPLIT_SECTION_CLASS_NAMES.major}>
                            <h3 className={SECTION_HEADING_CLASS_NAME}>{t('home.myCommentsTitle')}</h3>
                            {comments.length === 0 ? (
                                <DashboardPanelEmpty message={t('home.myCommentsEmpty')} />
                            ) : (
                                <FittedRowList
                                    label={t('home.myCommentsTitle')}
                                    className='flex-1'
                                    rowClassName='h-10 border-b border-border'
                                    rows={comments.map((comment) => ({
                                        id: comment.id,
                                        content: (
                                            <DashboardCommentRow
                                                comment={comment}
                                                isNew={newCommentIds.includes(comment.id)}
                                                onOpen={handleOpenComment}
                                            />
                                        ),
                                    }))}
                                />
                            )}
                        </section>
                    </div>
                </div>
            )}
        </DashboardPanel>
    )
}

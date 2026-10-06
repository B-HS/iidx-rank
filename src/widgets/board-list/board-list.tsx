'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { useBoardPosts } from '@entities/board/board.query'
import { BoardPagination } from '@features/board-pagination/board-pagination'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListSkeleton } from '@widgets/board-list/board-list-skeleton'
import { BoardPostListItem } from '@widgets/board-list/board-post-list-item'
import { BoardWriteButton } from '@widgets/board-list/board-write-button'

type BoardListProps = {
    page: number
    initialUserId: string | null
}

const FIRST_PAGE = 1
const LIST_PATH = '/board'

const getPageHref = (page: number) => (page === FIRST_PAGE ? LIST_PATH : `${LIST_PATH}?page=${page}`)

export const BoardList: FC<BoardListProps> = ({ page, initialUserId }) => {
    const t = useTranslations()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const postsQuery = useBoardPosts(page)
    const activeViewerId = isAligned ? viewerId : null
    const postList = isAligned ? postsQuery.data : undefined

    return (
        <BoardFrame title={t('navigation.board')} actions={<BoardWriteButton isSignedIn={activeViewerId !== null} />}>
            {!postList && isAligned && postsQuery.isError && (
                <Empty className='min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('board.listLoadErrorTitle')}</EmptyTitle>
                        <EmptyDescription>{t('board.loadErrorDescription')}</EmptyDescription>
                    </EmptyHeader>
                    <Button variant='outline' size='sm' disabled={postsQuery.isFetching} onClick={() => void postsQuery.refetch()}>
                        {t('common.retry')}
                    </Button>
                </Empty>
            )}
            {!postList && !(isAligned && postsQuery.isError) && <BoardListSkeleton />}
            {postList && postList.notices.length > 0 && (
                <section aria-labelledby='board-notices-heading' className='min-w-0 bg-muted/40'>
                    <h2 id='board-notices-heading' className='sr-only'>
                        {t('board.noticesHeading')}
                    </h2>
                    <ul className='min-w-0'>
                        {postList.notices.map((notice) => (
                            <BoardPostListItem key={notice.id} post={notice} viewerId={activeViewerId} />
                        ))}
                    </ul>
                </section>
            )}
            {postList && postList.posts.length > 0 && (
                <section aria-labelledby='board-posts-heading' className='min-w-0'>
                    <h2 id='board-posts-heading' className='sr-only'>
                        {t('board.postsHeading')}
                    </h2>
                    <ul className='min-w-0'>
                        {postList.posts.map((post) => (
                            <BoardPostListItem key={post.id} post={post} viewerId={activeViewerId} />
                        ))}
                    </ul>
                </section>
            )}
            {postList && postList.posts.length === 0 && (
                <Empty className='min-h-48 flex-none border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{page > FIRST_PAGE ? t('board.pageEmptyTitle') : t('board.listEmptyTitle')}</EmptyTitle>
                        <EmptyDescription>{page > FIRST_PAGE ? t('board.pageEmptyDescription') : t('board.listEmptyDescription')}</EmptyDescription>
                    </EmptyHeader>
                    {page > FIRST_PAGE && (
                        <Button variant='outline' size='sm' asChild>
                            <Link href={LIST_PATH}>{t('board.firstPage')}</Link>
                        </Button>
                    )}
                </Empty>
            )}
            {postList && (
                <BoardPagination
                    page={page}
                    totalPages={postList.pagination.totalPages}
                    label={t('board.postsPaginationLabel')}
                    className='p-3'
                    getHref={getPageHref}
                />
            )}
        </BoardFrame>
    )
}

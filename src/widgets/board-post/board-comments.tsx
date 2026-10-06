'use client'
import { type FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getBoardErrorKey } from '@entities/board/board-error'
import { BOARD_COMMENTS_PAGE_SIZE, type CommentCreateInput } from '@entities/board/board.dto'
import { useBoardComments, useCreateComment, useDeleteComment } from '@entities/board/board.query'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { BoardCommentForm } from '@features/board-comment-form/board-comment-form'
import { BoardPagination } from '@features/board-pagination/board-pagination'
import { getApiErrorCode } from '@shared/lib/api-client'
import { Button } from '@shared/ui/button'
import { Skeleton } from '@shared/ui/skeleton'
import { BoardCommentItem } from '@widgets/board-post/board-comment-item'

type BoardCommentsProps = {
    postId: string
    viewerId: string | null
}

const FIRST_PAGE = 1
const SKELETON_ROW_IDS = ['first', 'second', 'third'] as const

export const BoardComments: FC<BoardCommentsProps> = ({ postId, viewerId }) => {
    const [page, setPage] = useState(FIRST_PAGE)
    const [submittedCount, setSubmittedCount] = useState(0)
    const t = useTranslations()
    const commentsQuery = useBoardComments(postId, page)
    const createComment = useCreateComment(postId)
    const deleteComment = useDeleteComment()
    const commentList = commentsQuery.data
    const handleCreate = (input: CommentCreateInput) => {
        const lastPageAfterCreate = Math.ceil(((commentList?.pagination.total ?? 0) + 1) / BOARD_COMMENTS_PAGE_SIZE)

        createComment.mutate(input, {
            onSuccess: () => {
                setPage(lastPageAfterCreate)
                setSubmittedCount((count) => count + 1)
            },
        })
    }
    const handleDelete = (commentId: string) => {
        const isLastCommentOnPage = commentList?.comments.length === 1

        deleteComment.mutate(commentId, {
            onSuccess: () => setPage((currentPage) => (isLastCommentOnPage ? Math.max(currentPage - 1, FIRST_PAGE) : currentPage)),
        })
    }

    return (
        <section aria-labelledby='board-comments-heading' className='min-w-0 border-t border-border'>
            <h3 id='board-comments-heading' className='border-b border-border p-3 text-sm font-semibold'>
                {commentList ? t('board.commentsHeadingWithCount', { count: commentList.pagination.total }) : t('board.commentsHeading')}
            </h3>
            {!commentList && commentsQuery.isError && (
                <div className='flex min-w-0 flex-wrap items-center gap-2 border-b border-border p-3'>
                    <p className='text-sm text-muted-foreground'>{t('board.commentsLoadError')}</p>
                    <Button variant='outline' size='sm' disabled={commentsQuery.isFetching} onClick={() => void commentsQuery.refetch()}>
                        {t('common.retry')}
                    </Button>
                </div>
            )}
            {!commentList && !commentsQuery.isError && (
                <div role='status' aria-label={t('board.commentsLoading')} aria-busy='true' className='min-w-0'>
                    {SKELETON_ROW_IDS.map((id) => (
                        <div key={id} className='grid min-w-0 gap-2 border-b border-border p-3'>
                            <Skeleton className='h-4 w-48 max-w-full' />
                            <Skeleton className='h-4 w-full max-w-xl' />
                        </div>
                    ))}
                </div>
            )}
            {commentList?.comments.length === 0 && (
                <p className='border-b border-border p-3 text-sm text-muted-foreground'>{t('board.commentsEmpty')}</p>
            )}
            {commentList && commentList.comments.length > 0 && (
                <ul className='min-w-0'>
                    {commentList.comments.map((comment) => (
                        <BoardCommentItem
                            key={comment.id}
                            comment={comment}
                            viewerId={viewerId}
                            isDeleting={deleteComment.isPending && deleteComment.variables === comment.id}
                            onDelete={() => handleDelete(comment.id)}
                        />
                    ))}
                </ul>
            )}
            {commentList && (
                <BoardPagination
                    page={page}
                    totalPages={commentList.pagination.totalPages}
                    label={t('board.commentsPaginationLabel')}
                    className='border-b border-border p-3'
                    onPageChange={setPage}
                />
            )}
            <div className='min-w-0 p-3'>
                {viewerId === null ? (
                    <div className='flex min-w-0 flex-wrap items-center gap-2'>
                        <p className='text-sm text-muted-foreground'>{t('board.commentSignInPrompt')}</p>
                        <AuthDialogWidget>
                            <Button variant='outline' size='sm'>
                                {t('navigation.signIn')}
                            </Button>
                        </AuthDialogWidget>
                    </div>
                ) : (
                    <BoardCommentForm
                        key={submittedCount}
                        isSubmitting={createComment.isPending}
                        errorMessage={
                            createComment.error ? t(getBoardErrorKey(getApiErrorCode(createComment.error)) ?? 'board.commentCreateError') : undefined
                        }
                        onSubmit={handleCreate}
                    />
                )}
            </div>
        </section>
    )
}

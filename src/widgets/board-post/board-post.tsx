'use client'
import type { FC, PropsWithChildren } from 'react'
import { Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { BOARD_POST_KIND } from '@entities/board/board.dto'
import { useBoardPost, useDeletePost } from '@entities/board/board.query'
import { BoardDeleteButton } from '@features/board-delete-button/board-delete-button'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Link, useRouter } from '@shared/i18n/navigation'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { BoardAuthorMenu } from '@widgets/board-list/board-author-menu'
import { BoardComments } from '@widgets/board-post/board-comments'
import { BoardPostSkeleton } from '@widgets/board-post/board-post-skeleton'

type BoardPostProps = PropsWithChildren<{
    postId: string
    initialUserId: string | null
}>

export const BoardPost: FC<BoardPostProps> = ({ postId, initialUserId, children }) => {
    const t = useTranslations()
    const router = useRouter()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const postQuery = useBoardPost(postId)
    const deletePost = useDeletePost()
    const post = postQuery.data

    if (!isAligned) return <BoardPostSkeleton />

    if (!post && postQuery.isError) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('board.postLoadErrorTitle')}</EmptyTitle>
                    <EmptyDescription>{t('board.loadErrorDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' size='sm' disabled={postQuery.isFetching} onClick={() => void postQuery.refetch()}>
                    {t('common.retry')}
                </Button>
            </Empty>
        )
    }

    if (!post) return <BoardPostSkeleton />

    return (
        <article className='w-full max-w-3xl min-w-0 flex-1 border-border xl:border-r'>
            <header className='grid min-w-0 gap-2 border-b border-border p-3'>
                <div className='flex min-w-0 items-start gap-2'>
                    {post.kind === BOARD_POST_KIND.NOTICE && (
                        <Badge variant='secondary' className='mt-1'>
                            {t('board.noticeBadge')}
                        </Badge>
                    )}
                    <h2 className='min-w-0 text-lg leading-tight font-semibold break-words'>{post.title}</h2>
                </div>
                <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground'>
                    <UserAvatar
                        name={post.author.name}
                        avatarUrl={post.author.avatarUrl}
                        className='size-6 [&_[data-slot=avatar-fallback]]:text-xs'
                    />
                    <BoardAuthorMenu author={post.author} viewerId={viewerId} className='font-medium text-foreground' />
                    <BoardTimestamp value={post.createdAt} className='shrink-0 whitespace-nowrap' />
                    {post.updatedAt !== post.createdAt && (
                        <span className='shrink-0 whitespace-nowrap'>
                            {t('board.editedAt')} <BoardTimestamp value={post.updatedAt} />
                        </span>
                    )}
                    {viewerId !== null && (post.canEdit || post.canDelete) && (
                        <div className='ml-auto flex shrink-0 items-center gap-1'>
                            {post.canEdit && (
                                <Button variant='outline' size='sm' asChild>
                                    <Link href={`/board/${post.id}/edit`}>
                                        <Pencil aria-hidden='true' />
                                        {t('board.edit')}
                                    </Link>
                                </Button>
                            )}
                            {post.canDelete && (
                                <BoardDeleteButton
                                    label={t('board.postDelete')}
                                    confirmTitle={t('board.postDeleteConfirmTitle')}
                                    confirmDescription={t('board.deleteConfirmDescription')}
                                    isPending={deletePost.isPending || deletePost.isSuccess}
                                    isLabelVisible
                                    onConfirm={() => deletePost.mutate(post.id, { onSuccess: () => router.push('/board') })}
                                />
                            )}
                        </div>
                    )}
                </div>
            </header>
            <div className='min-w-0 p-3'>{children}</div>
            <BoardComments postId={post.id} viewerId={viewerId} />
        </article>
    )
}

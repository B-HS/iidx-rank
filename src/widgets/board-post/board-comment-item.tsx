'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import type { Comment } from '@entities/board/board.dto'
import { BoardDeleteButton } from '@features/board-delete-button/board-delete-button'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { BoardAuthorMenu } from '@widgets/board-list/board-author-menu'

type BoardCommentItemProps = {
    comment: Comment
    viewerId: string | null
    isDeleting: boolean
    onDelete: () => void
}

export const BoardCommentItem: FC<BoardCommentItemProps> = ({ comment, viewerId, isDeleting, onDelete }) => {
    const t = useTranslations('board')

    return (
        <li className='grid min-w-0 gap-1.5 border-b border-border p-3'>
            <div className='flex min-h-7 min-w-0 items-center gap-2 text-xs text-muted-foreground'>
                <UserAvatar
                    name={comment.author.name}
                    avatarUrl={comment.author.avatarUrl}
                    className='size-6 [&_[data-slot=avatar-fallback]]:text-xs'
                />
                <BoardAuthorMenu author={comment.author} viewerId={viewerId} className='font-medium text-foreground' />
                <BoardTimestamp value={comment.createdAt} className='shrink-0 whitespace-nowrap' />
                {comment.canDelete && viewerId !== null && (
                    <BoardDeleteButton
                        label={t('commentDelete')}
                        confirmTitle={t('commentDeleteConfirmTitle')}
                        confirmDescription={t('deleteConfirmDescription')}
                        isPending={isDeleting}
                        className='ml-auto shrink-0'
                        onConfirm={onDelete}
                    />
                )}
            </div>
            <p className='min-w-0 text-sm break-words whitespace-pre-wrap'>{comment.content}</p>
        </li>
    )
}

'use client'
import type { FC } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BOARD_POST_KIND, type PostSummary } from '@entities/board/board.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { Link } from '@shared/i18n/navigation'
import { Badge } from '@shared/ui/badge'
import { BoardAuthorMenu } from '@widgets/board-list/board-author-menu'

type BoardPostListItemProps = {
    post: PostSummary
    viewerId: string | null
}

export const BoardPostListItem: FC<BoardPostListItemProps> = ({ post, viewerId }) => {
    const t = useTranslations('board')

    return (
        <li className='relative flex min-w-0 flex-col gap-1 border-b border-border px-3 py-2 hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-3'>
            <div className='flex min-w-0 flex-1 items-center gap-2'>
                {post.kind === BOARD_POST_KIND.NOTICE && <Badge variant='secondary'>{t('noticeBadge')}</Badge>}
                <Link
                    href={`/board/${post.id}`}
                    className='min-w-0 truncate text-sm font-medium outline-none after:absolute after:inset-0 hover:underline focus-visible:underline focus-visible:after:ring-[3px] focus-visible:after:ring-ring/50 focus-visible:after:ring-inset'>
                    {post.title}
                </Link>
                {post.commentCount > 0 && (
                    <span className='flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground tabular-nums'>
                        <MessageSquare aria-hidden='true' className='size-3' />
                        <span className='sr-only'>{t('commentCountLabel')}</span>
                        {post.commentCount}
                    </span>
                )}
            </div>
            <div className='pointer-events-none relative flex min-w-0 shrink-0 items-center gap-2 text-xs text-muted-foreground [&_button]:pointer-events-auto'>
                <BoardAuthorMenu author={post.author} viewerId={viewerId} className='max-w-40' />
                <BoardTimestamp value={post.createdAt} className='shrink-0 whitespace-nowrap' />
            </div>
        </li>
    )
}

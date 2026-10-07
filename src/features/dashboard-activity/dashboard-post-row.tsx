import type { FC } from 'react'
import { MessageSquare } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getBoardPostPathname } from '@entities/board/board-page'
import { BOARD_POST_KIND, type PostSummary } from '@entities/board/board.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { Link } from '@shared/i18n/navigation'
import { Badge } from '@shared/ui/badge'

type DashboardPostRowProps = {
    post: Pick<PostSummary, 'id' | 'kind' | 'title' | 'commentCount' | 'createdAt'>
    authorName?: string
}

export const DashboardPostRow: FC<DashboardPostRowProps> = ({ post, authorName }) => {
    const t = useTranslations('board')

    return (
        <Link
            href={getBoardPostPathname(post.id)}
            className='flex h-full min-w-0 items-center gap-2 px-3 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'>
            {post.kind === BOARD_POST_KIND.NOTICE && (
                <Badge variant='secondary' className='h-4 px-1.5 text-2xs'>
                    {t('noticeBadge')}
                </Badge>
            )}
            <span className='min-w-0 flex-1 truncate text-xs font-medium'>{post.title}</span>
            {post.commentCount > 0 && (
                <span className='flex shrink-0 items-center gap-0.5 text-2xs text-muted-foreground tabular-nums'>
                    <MessageSquare aria-hidden='true' className='size-3' />
                    <span className='sr-only'>{t('commentCountLabel')}</span>
                    {post.commentCount}
                </span>
            )}
            {authorName && <span className='max-w-16 shrink-0 truncate text-2xs text-muted-foreground'>{authorName}</span>}
            <BoardTimestamp value={post.createdAt} isCompact className='shrink-0 text-2xs whitespace-nowrap text-muted-foreground tabular-nums' />
        </Link>
    )
}

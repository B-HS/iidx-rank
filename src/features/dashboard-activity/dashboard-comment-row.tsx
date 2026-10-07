import type { FC } from 'react'
import { CornerDownRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getBoardPostPathname } from '@entities/board/board-page'
import type { MyPostComment } from '@entities/board/board.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { Link } from '@shared/i18n/navigation'
import { cn } from '@shared/lib/utils'
import { Badge } from '@shared/ui/badge'

type DashboardCommentRowProps = {
    comment: MyPostComment
    isNew: boolean
    onOpen: (comment: MyPostComment) => void
}

export const DashboardCommentRow: FC<DashboardCommentRowProps> = ({ comment, isNew, onOpen }) => {
    const t = useTranslations('home')

    return (
        <Link
            href={getBoardPostPathname(comment.postId)}
            onClick={() => onOpen(comment)}
            className={cn(
                'grid h-full min-w-0 content-center border-l-2 border-transparent pr-3 pl-2.5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                isNew && 'border-primary',
            )}>
            <span className='flex min-w-0 items-center gap-1.5 text-xs leading-4'>
                {isNew && <Badge className='h-4 px-1.5 text-2xs'>{t('commentNew')}</Badge>}
                <span className='max-w-28 shrink-0 truncate font-medium'>{comment.author.name}</span>
                <span className='min-w-0 flex-1 truncate text-muted-foreground'>{comment.excerpt}</span>
            </span>
            <span className='flex min-w-0 items-center gap-1.5 text-2xs leading-4 text-muted-foreground'>
                <CornerDownRight aria-hidden='true' className='size-3 shrink-0' />
                <span className='min-w-0 flex-1 truncate'>{comment.postTitle}</span>
                <BoardTimestamp value={comment.createdAt} isCompact className='shrink-0 whitespace-nowrap tabular-nums' />
            </span>
        </Link>
    )
}

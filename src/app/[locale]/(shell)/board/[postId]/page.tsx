import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { boardCommentsQueryOptions, boardPostQueryOptions } from '@entities/board/board.query-options'
import { getBoardCommentList, getBoardPost, getBoardViewer } from '@entities/board/board.server'
import { parseRichTextDocument } from '@entities/board/rich-text'
import { RichTextContent } from '@features/rich-text-content/rich-text-content'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListLink } from '@widgets/board-list/board-list-link'
import { BoardPost } from '@widgets/board-post/board-post'
import { BoardPostSkeleton } from '@widgets/board-post/board-post-skeleton'
import { BoardPostUnavailable } from '@widgets/board-post/board-post-unavailable'

type BoardPostRouteProps = Pick<PageProps<'/[locale]/board/[postId]'>, 'params'>

const FIRST_COMMENTS_PAGE = 1

const BoardPostDataBoundary = async ({ params }: BoardPostRouteProps) => {
    const [{ postId }, viewer, t] = await Promise.all([params, getBoardViewer(), getTranslations('board')])
    const post = await getBoardPost(viewer, postId)

    if (!post) return <BoardPostUnavailable />

    const comments = await getBoardCommentList(viewer, post.id, FIRST_COMMENTS_PAGE)
    const content = parseRichTextDocument(post.content)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await Promise.all([
        queryClient.prefetchQuery(boardPostQueryOptions(post.id, async () => post)),
        comments ? queryClient.prefetchQuery(boardCommentsQueryOptions(post.id, FIRST_COMMENTS_PAGE, async () => comments)) : null,
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardPost postId={post.id} initialUserId={viewer?.userId ?? null}>
                {content.ok ? (
                    <RichTextContent content={content.document} />
                ) : (
                    <p className='text-sm text-muted-foreground'>{t('contentUnavailable')}</p>
                )}
            </BoardPost>
        </HydrationBoundary>
    )
}

const BoardPostPage = ({ params }: BoardPostRouteProps) => {
    const t = useTranslations('navigation')

    return (
        <BoardFrame title={t('board')} actions={<BoardListLink />}>
            <Suspense fallback={<BoardPostSkeleton />}>
                <BoardPostDataBoundary params={params} />
            </Suspense>
        </BoardFrame>
    )
}

export const generateMetadata = async () => {
    const t = await getTranslations('navigation')
    return { title: t('board') }
}

export default BoardPostPage

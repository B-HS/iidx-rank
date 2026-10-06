import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { boardPostQueryOptions } from '@entities/board/board.query-options'
import { getBoardPost, getBoardViewer } from '@entities/board/board.server'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { BoardEditorSkeleton } from '@widgets/board-editor/board-editor-skeleton'
import { BoardPostEdit } from '@widgets/board-editor/board-post-edit'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListLink } from '@widgets/board-list/board-list-link'
import { BoardPostUnavailable } from '@widgets/board-post/board-post-unavailable'

type BoardPostEditRouteProps = Pick<PageProps<'/[locale]/board/[postId]/edit'>, 'params'>

const BoardPostEditDataBoundary = async ({ params }: BoardPostEditRouteProps) => {
    const [{ postId }, viewer] = await Promise.all([params, getBoardViewer()])
    const post = await getBoardPost(viewer, postId)

    if (!post) return <BoardPostUnavailable />

    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await queryClient.prefetchQuery(boardPostQueryOptions(post.id, async () => post))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardPostEdit postId={post.id} initialUserId={viewer?.userId ?? null} />
        </HydrationBoundary>
    )
}

const BoardPostEditPage = ({ params }: BoardPostEditRouteProps) => {
    const t = useTranslations('board')

    return (
        <BoardFrame title={t('editTitle')} actions={<BoardListLink />}>
            <Suspense fallback={<BoardEditorSkeleton />}>
                <BoardPostEditDataBoundary params={params} />
            </Suspense>
        </BoardFrame>
    )
}

export const generateMetadata = async () => {
    const t = await getTranslations('board')
    return { title: t('editTitle') }
}

export default BoardPostEditPage

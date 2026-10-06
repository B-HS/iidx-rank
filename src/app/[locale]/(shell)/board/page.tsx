import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { BoardPageQuerySchema } from '@entities/board/board.dto'
import { boardPostsQueryOptions } from '@entities/board/board.query-options'
import { getBoardPostList, getBoardViewer } from '@entities/board/board.server'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { BoardList } from '@widgets/board-list/board-list'
import { BoardListLoading } from '@widgets/board-list/board-list-loading'

type BoardListRouteProps = Pick<PageProps<'/[locale]/board'>, 'searchParams'>

const FIRST_PAGE = 1

const BoardListDataBoundary = async ({ searchParams }: BoardListRouteProps) => {
    const [query, viewer] = await Promise.all([searchParams, getBoardViewer()])
    const parsedQuery = BoardPageQuerySchema.safeParse({ page: [query.page].flat()[0] })
    const page = parsedQuery.success ? parsedQuery.data.page : FIRST_PAGE
    const postList = await getBoardPostList(viewer, page)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await queryClient.prefetchQuery(boardPostsQueryOptions(page, async () => postList))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardList page={page} initialUserId={viewer?.userId ?? null} />
        </HydrationBoundary>
    )
}

const BoardListPage = ({ searchParams }: BoardListRouteProps) => (
    <Suspense fallback={<BoardListLoading />}>
        <BoardListDataBoundary searchParams={searchParams} />
    </Suspense>
)

export default BoardListPage

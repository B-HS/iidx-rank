import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import { BoardPageQuerySchema } from '@entities/board/board.dto'
import { getBoardListPathname } from '@entities/board/board-page'
import { boardPostsQueryOptions } from '@entities/board/board.query-options'
import { getBoardPostList, getBoardViewer } from '@entities/board/board.server'
import { BoardListJsonLd } from '@features/json-ld/board-list-json-ld'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { createPageMetadata } from '@shared/lib/seo'
import { BoardList } from '@widgets/board-list/board-list'
import { BoardListLoading } from '@widgets/board-list/board-list-loading'

type BoardListRouteProps = Pick<PageProps<'/[locale]/board'>, 'searchParams'>

const FIRST_PAGE = 1

const readBoardPage = async (searchParams: BoardListRouteProps['searchParams']) => {
    const parsedQuery = BoardPageQuerySchema.safeParse({ page: [(await searchParams).page].flat()[0] })

    return parsedQuery.success ? parsedQuery.data.page : FIRST_PAGE
}

const BoardListDataBoundary = async ({ searchParams }: BoardListRouteProps) => {
    const [page, viewer] = await Promise.all([readBoardPage(searchParams), getBoardViewer()])
    const postList = await getBoardPostList(viewer, page)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await queryClient.prefetchQuery(boardPostsQueryOptions(page, async () => postList))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BoardListJsonLd page={page} posts={[...postList.notices, ...postList.posts]} />
            <BoardList page={page} initialUserId={viewer?.userId ?? null} />
        </HydrationBoundary>
    )
}

const BoardListPage = ({ searchParams }: BoardListRouteProps) => (
    <Suspense fallback={<BoardListLoading />}>
        <BoardListDataBoundary searchParams={searchParams} />
    </Suspense>
)

export const generateMetadata = async ({ searchParams }: BoardListRouteProps) => {
    const [page, locale, t] = await Promise.all([readBoardPage(searchParams), getLocale(), getTranslations()])

    return createPageMetadata({
        locale,
        pathname: getBoardListPathname(page),
        title: page > FIRST_PAGE ? t('seo.boardPagedTitle', { page }) : t('navigation.board'),
        description: t('seo.boardDescription'),
        siteName: t('app.name'),
    })
}

export default BoardListPage

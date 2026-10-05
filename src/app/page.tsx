import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { type FC, Suspense } from 'react'

import { getCatalog, ensureCatalogFresh } from '@entities/catalog/catalog.server'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { getChecker } from '@entities/checker/checker.server'
import { checkerQueryOptions } from '@entities/checker/checker.query-options'
import { getSession } from '@shared/server/auth'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { MESSAGES } from '@shared/messages/messages'
import { CheckerWorkspace } from '@widgets/checker-workspace/checker-workspace'
import { CheckerLoading } from '@widgets/checker-workspace/checker-loading'

const CheckerDataBoundary = async () => {
    const session = await getSession()
    const freshness = await ensureCatalogFresh()
    const userId = session?.user.id ?? null
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: DEFAULT_QUERY_STALE_TIME_MS,
            },
        },
    })
    const catalogOptions = catalogQueryOptions(getCatalog)

    await queryClient.prefetchQuery(catalogOptions)

    if (queryClient.getQueryState(catalogOptions.queryKey)?.status === 'error') {
        throw queryClient.getQueryState(catalogOptions.queryKey)?.error
    }

    if (userId) {
        const checkerOptions = checkerQueryOptions(userId, () => getChecker(userId))

        await queryClient.prefetchQuery(checkerOptions)

        if (queryClient.getQueryState(checkerOptions.queryKey)?.status === 'error') {
            throw queryClient.getQueryState(checkerOptions.queryKey)?.error
        }
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CheckerWorkspace initialUserId={userId} sourceRefreshFailed={freshness.isRefreshFailed} />
        </HydrationBoundary>
    )
}

const HomePage: FC = () => (
    <Suspense fallback={<CheckerLoading label={MESSAGES.common.loading} />}>
        <CheckerDataBoundary />
    </Suspense>
)

export default HomePage

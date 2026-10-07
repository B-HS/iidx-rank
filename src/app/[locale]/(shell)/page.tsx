import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import { boardPostsQueryOptions, myBoardActivityQueryOptions } from '@entities/board/board.query-options'
import { getBoardPostList, getBoardViewer, getMyBoardActivity } from '@entities/board/board.server'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { getCatalogForShell } from '@entities/catalog/catalog.server'
import { checkerQueryOptions } from '@entities/checker/checker.query-options'
import { getChecker } from '@entities/checker/checker.server'
import { importStatusQueryOptions } from '@entities/eamusement/eamusement.query-options'
import { getImportStatus } from '@entities/eamusement/eamusement.server'
import { myProfileQueryOptions, profileQueryOptions } from '@entities/profile/profile.query-options'
import { getMyProfile, getProfile } from '@entities/profile/profile.server'
import { HomeJsonLd } from '@features/json-ld/home-json-ld'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { DASHBOARD_BOARD_PAGE } from '@shared/constants/dashboard'
import { createPageMetadata } from '@shared/lib/seo'
import { HomeDashboard } from '@widgets/home-dashboard/home-dashboard'
import { HomeDashboardFrame } from '@widgets/home-dashboard/home-dashboard-frame'
import { HomeDashboardSkeleton } from '@widgets/home-dashboard/home-dashboard-skeleton'

const prefetchOwnProfile = async (queryClient: QueryClient, userId: string) => {
    try {
        const myProfile = await getMyProfile(userId)
        const profile = myProfile ? await getProfile(myProfile.handle, userId) : null

        await Promise.all([
            myProfile ? queryClient.prefetchQuery(myProfileQueryOptions(async () => myProfile)) : null,
            myProfile && profile ? queryClient.prefetchQuery(profileQueryOptions(myProfile.handle, async () => profile)) : null,
        ])
    } catch {
        return
    }
}

const HomeDashboardDataBoundary = async () => {
    const viewer = await getBoardViewer()
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await Promise.all([
        queryClient.prefetchQuery(catalogQueryOptions(() => getCatalogForShell())),
        ...(viewer
            ? [
                  queryClient.prefetchQuery(checkerQueryOptions(viewer.userId, () => getChecker(viewer.userId))),
                  queryClient.prefetchQuery(importStatusQueryOptions(() => getImportStatus(viewer.userId))),
                  queryClient.prefetchQuery(myBoardActivityQueryOptions(() => getMyBoardActivity(viewer))),
                  prefetchOwnProfile(queryClient, viewer.userId),
              ]
            : [queryClient.prefetchQuery(boardPostsQueryOptions(DASHBOARD_BOARD_PAGE, () => getBoardPostList(null, DASHBOARD_BOARD_PAGE)))]),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <HomeDashboard initialUserId={viewer?.userId ?? null} />
        </HydrationBoundary>
    )
}

const HomePage = () => (
    <>
        <HomeJsonLd />
        <HomeDashboardFrame>
            <Suspense fallback={<HomeDashboardSkeleton />}>
                <HomeDashboardDataBoundary />
            </Suspense>
        </HomeDashboardFrame>
    </>
)

export const generateMetadata = async () => {
    const [locale, t] = await Promise.all([getLocale(), getTranslations('app')])

    return createPageMetadata({
        locale,
        pathname: '/',
        title: t('title'),
        description: t('description'),
        siteName: t('name'),
        isTitleAbsolute: true,
    })
}

export default HomePage

import { Suspense } from 'react'
import { cookies } from 'next/headers'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import type { Catalog } from '@entities/catalog/catalog.dto'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { getCatalogForShell } from '@entities/catalog/catalog.server'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { getChecker } from '@entities/checker/checker.server'
import { checkerQueryOptions } from '@entities/checker/checker.query-options'
import { getDisplayPreferences } from '@entities/preferences/preferences.server'
import { parseAnonymousPreferences } from '@entities/preferences/anonymous-preferences.dto'
import { displayPreferencesQueryOptions } from '@entities/preferences/preferences.query-options'
import { ANONYMOUS_PREFERENCES_COOKIE_NAME, DEFAULT_DISPLAY_PREFERENCES } from '@shared/constants/display'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { USER_ROLE } from '@shared/constants/user-role'
import { getSession } from '@shared/server/auth'
import { CheckerWorkspace } from '@widgets/checker-workspace/checker-workspace'
import { CheckerLoading } from '@widgets/checker-workspace/checker-loading'

type DataProps = {
    catalog: Catalog
    userId: string | null
    isAdmin: boolean
    preferences: DisplayPreferencesInput
    anonymousPreferences: DisplayPreferencesInput | null
}
const CheckerDataBoundary = async ({ catalog, userId, isAdmin, preferences, anonymousPreferences }: DataProps) => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })
    await queryClient.prefetchQuery(catalogQueryOptions(async () => catalog))
    if (userId) {
        const checkerOptions = checkerQueryOptions(userId, () => getChecker(userId))
        await Promise.all([
            queryClient.prefetchQuery(checkerOptions),
            queryClient.prefetchQuery(displayPreferencesQueryOptions(userId, async () => ({ userId, preferences }))),
        ])
        if (queryClient.getQueryState(checkerOptions.queryKey)?.status === 'error') throw queryClient.getQueryState(checkerOptions.queryKey)?.error
    }
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CheckerWorkspace
                initialUserId={userId}
                initialIsAdmin={isAdmin}
                initialPreferences={preferences}
                initialAnonymousPreferences={anonymousPreferences}
            />
        </HydrationBoundary>
    )
}
const CheckerAppearanceBoundary = async ({ catalog }: Pick<DataProps, 'catalog'>) => {
    const [session, store] = await Promise.all([getSession(), cookies()])
    const userId = session?.user.id ?? null
    const anonymousPreferences = parseAnonymousPreferences(store.get(ANONYMOUS_PREFERENCES_COOKIE_NAME)?.value)
    const preferences = userId ? (await getDisplayPreferences(userId)).preferences : (anonymousPreferences ?? DEFAULT_DISPLAY_PREFERENCES)
    return (
        <Suspense fallback={<CheckerLoading catalog={catalog} versionDisplay={preferences.versionDisplay} />}>
            <CheckerDataBoundary
                catalog={catalog}
                userId={userId}
                isAdmin={session?.user.role === USER_ROLE.ADMIN}
                preferences={preferences}
                anonymousPreferences={anonymousPreferences}
            />
        </Suspense>
    )
}
const TablePage = async () => {
    const catalog = await getCatalogForShell()
    return (
        <Suspense fallback={<CheckerLoading catalog={catalog} />}>
            <CheckerAppearanceBoundary catalog={catalog} />
        </Suspense>
    )
}
export default TablePage

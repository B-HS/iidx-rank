import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { profileQueryOptions, profileRecordsQueryOptions } from '@entities/profile/profile.query-options'
import { getProfile, getProfileRecords } from '@entities/profile/profile.server'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { getSession } from '@shared/server/auth'
import { UserPage } from '@widgets/user-page/user-page'
import { UserPageFrame } from '@widgets/user-page/user-page-frame'
import { UserPageSkeleton } from '@widgets/user-page/user-page-skeleton'

type UserPageRouteProps = Pick<PageProps<'/[locale]/u/[handle]'>, 'params'>

const UserPageDataBoundary = async ({ params }: UserPageRouteProps) => {
    const [{ handle }, session] = await Promise.all([params, getSession()])
    const viewerId = session?.user.id ?? null
    const parsedHandle = HandleSchema.safeParse(handle)
    const profile = parsedHandle.success ? await getProfile(parsedHandle.data, viewerId) : null

    if (!profile) return <UserPage handle={handle} initialUserId={viewerId} isAvailable={false} />

    const records = await getProfileRecords(profile.handle, viewerId)
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await Promise.all([
        queryClient.prefetchQuery(profileQueryOptions(profile.handle, async () => profile)),
        records ? queryClient.prefetchQuery(profileRecordsQueryOptions(profile.handle, async () => records)) : null,
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <UserPage handle={profile.handle} initialUserId={viewerId} isAvailable />
        </HydrationBoundary>
    )
}

const UserPageRoute = ({ params }: UserPageRouteProps) => (
    <UserPageFrame>
        <Suspense fallback={<UserPageSkeleton />}>
            <UserPageDataBoundary params={params} />
        </Suspense>
    </UserPageFrame>
)

export default UserPageRoute

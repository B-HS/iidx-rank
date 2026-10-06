import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getLocale, getTranslations } from 'next-intl/server'
import { profileQueryOptions, profileRecordsQueryOptions } from '@entities/profile/profile.query-options'
import { getProfile, getProfileRecords } from '@entities/profile/profile.server'
import { getProfilePageTitle, getProfilePathname } from '@entities/profile/profile-page'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { ProfileJsonLd } from '@features/json-ld/profile-json-ld'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { createPageMetadata, createSeoDescription, getAbsoluteUrl, NO_INDEX_ROBOTS } from '@shared/lib/seo'
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
            {profile.isPublic && <ProfileJsonLd profile={profile} />}
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

export const generateMetadata = async ({ params }: UserPageRouteProps) => {
    const [{ handle }, locale, t] = await Promise.all([params, getLocale(), getTranslations()])
    const parsedHandle = HandleSchema.safeParse(handle)
    const profile = parsedHandle.success ? await getProfile(parsedHandle.data, null) : null

    if (!profile) return { title: t('profile.pageTitle'), robots: NO_INDEX_ROBOTS }

    const description = createSeoDescription(profile.bio)

    return createPageMetadata({
        locale,
        pathname: getProfilePathname(profile.handle),
        title: getProfilePageTitle(profile),
        description: description === '' ? t('seo.profileFallbackDescription', { name: profile.name, handle: profile.handle }) : description,
        siteName: t('app.name'),
        openGraph: { type: 'profile', username: profile.handle },
        imageUrl: profile.avatarUrl === null ? null : getAbsoluteUrl(profile.avatarUrl),
    })
}

export default UserPageRoute

import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'
import { myProfileQueryOptions } from '@entities/profile/profile.query-options'
import { getMyProfile } from '@entities/profile/profile.server'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { NO_INDEX_ROBOTS } from '@shared/lib/seo'
import { getSession } from '@shared/server/auth'
import { ProfileSettings } from '@widgets/profile-settings/profile-settings'
import { ProfileSettingsFrame } from '@widgets/profile-settings/profile-settings-frame'
import { ProfileSettingsSkeleton } from '@widgets/profile-settings/profile-settings-skeleton'

const ProfileSettingsDataBoundary = async () => {
    const session = await getSession()
    const userId = session?.user.id ?? null
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })
    const profile = userId ? await getMyProfile(userId) : null

    if (profile) await queryClient.prefetchQuery(myProfileQueryOptions(async () => profile))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ProfileSettings initialUserId={userId} />
        </HydrationBoundary>
    )
}

const SettingsPage = () => (
    <ProfileSettingsFrame>
        <Suspense fallback={<ProfileSettingsSkeleton />}>
            <ProfileSettingsDataBoundary />
        </Suspense>
    </ProfileSettingsFrame>
)

export const generateMetadata = async () => {
    const t = await getTranslations('settings')
    return { title: t('title'), robots: NO_INDEX_ROBOTS }
}

export default SettingsPage

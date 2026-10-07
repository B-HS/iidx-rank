'use client'
import type { FC } from 'react'
import { CircleUserRound, UserRoundPen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useImportStatus } from '@entities/eamusement/eamusement.query'
import { getProfilePathname } from '@entities/profile/profile-page'
import { useMyProfile, useProfile } from '@entities/profile/profile.query'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'
import { DashboardIdentity } from '@features/dashboard-profile/dashboard-identity'
import { DashboardImportSummary } from '@features/dashboard-profile/dashboard-import-summary'
import { DashboardPlayerInfo } from '@features/dashboard-profile/dashboard-player-info'

type HomeProfilePanelProps = {
    userId: string
}

const SETTINGS_PATHNAME = '/settings'

export const HomeProfilePanel: FC<HomeProfilePanelProps> = ({ userId }) => {
    const t = useTranslations()
    const myProfileQuery = useMyProfile(true)
    const myProfile = myProfileQuery.data?.userId === userId ? myProfileQuery.data : undefined
    const profileQuery = useProfile(myProfile?.handle ?? '', myProfile !== undefined)
    const statusQuery = useImportStatus(true)
    const latest = statusQuery.data?.latest
    const isProfileFailed = !myProfile && myProfileQuery.isError
    const isStatusFailed = !statusQuery.data && statusQuery.isError

    return (
        <DashboardPanel
            title={t('home.profileTitle')}
            bodyClassName='gap-2.5'
            actions={
                <>
                    {myProfile && (
                        <DashboardPanelLink href={getProfilePathname(myProfile.handle)}>
                            <CircleUserRound aria-hidden='true' />
                            {t('navigation.myPage')}
                        </DashboardPanelLink>
                    )}
                    <DashboardPanelLink href={SETTINGS_PATHNAME}>
                        <UserRoundPen aria-hidden='true' />
                        {t('navigation.profileSettings')}
                    </DashboardPanelLink>
                </>
            }>
            {isProfileFailed && (
                <DashboardPanelError
                    message={t('home.profileLoadError')}
                    isRetrying={myProfileQuery.isFetching}
                    onRetry={() => void myProfileQuery.refetch()}
                />
            )}
            {!isProfileFailed && !myProfile && <DashboardPanelLoading label={t('profile.loading')} />}
            {myProfile && (
                <>
                    <DashboardIdentity
                        name={myProfile.name}
                        handle={myProfile.handle}
                        avatarUrl={myProfile.avatarUrl}
                        isPublic={myProfile.isPublic}
                        counts={profileQuery.data ?? null}
                    />
                    {isStatusFailed && (
                        <DashboardPanelError
                            message={t('settings.eamusementStatusLoadError')}
                            isRetrying={statusQuery.isFetching}
                            onRetry={() => void statusQuery.refetch()}
                        />
                    )}
                    {!isStatusFailed && !statusQuery.data && <DashboardPanelLoading label={t('settings.eamusementStatusLoading')} />}
                    {statusQuery.data && !latest && (
                        <DashboardPanelEmpty message={t('home.importEmpty')}>
                            <DashboardPanelLink href={SETTINGS_PATHNAME} variant='outline'>
                                {t('home.importAction')}
                            </DashboardPanelLink>
                        </DashboardPanelEmpty>
                    )}
                    {latest && (
                        <>
                            <DashboardPlayerInfo player={latest.player} />
                            <DashboardImportSummary status={latest} />
                        </>
                    )}
                </>
            )}
        </DashboardPanel>
    )
}

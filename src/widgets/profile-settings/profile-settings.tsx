'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { useMyProfile } from '@entities/profile/profile.query'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { ProfileSettingsSection } from '@features/profile-settings-section/profile-settings-section'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { BlockedUsers } from '@widgets/blocked-users/blocked-users'
import { ProfileSettingsForm } from '@widgets/profile-settings/profile-settings-form'
import { ProfileSettingsSkeleton } from '@widgets/profile-settings/profile-settings-skeleton'

type ProfileSettingsProps = {
    initialUserId: string | null
}

export const ProfileSettings: FC<ProfileSettingsProps> = ({ initialUserId }) => {
    const t = useTranslations()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const myProfileQuery = useMyProfile(isAligned && viewerId !== null)

    if (!isAligned) return <ProfileSettingsSkeleton />

    if (viewerId === null) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('settings.signInTitle')}</EmptyTitle>
                    <EmptyDescription>{t('settings.signInDescription')}</EmptyDescription>
                </EmptyHeader>
                <AuthDialogWidget>
                    <Button variant='outline' size='sm'>
                        {t('navigation.signIn')}
                    </Button>
                </AuthDialogWidget>
            </Empty>
        )
    }

    if (myProfileQuery.isError) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('settings.loadErrorTitle')}</EmptyTitle>
                    <EmptyDescription>{t('settings.loadErrorDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' size='sm' disabled={myProfileQuery.isFetching} onClick={() => void myProfileQuery.refetch()}>
                    {t('common.retry')}
                </Button>
            </Empty>
        )
    }

    const profile = myProfileQuery.data

    if (!profile || profile.userId !== viewerId) return <ProfileSettingsSkeleton />

    return (
        <>
            <ProfileSettingsForm key={profile.userId} profile={profile} />
            <ProfileSettingsSection title={t('settings.blockedSection')} description={t('settings.blockedSectionDescription')}>
                <BlockedUsers />
            </ProfileSettingsSection>
        </>
    )
}

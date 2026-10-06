'use client'
import { type FC, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { useProfile, useToggleFollow } from '@entities/profile/profile.query'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { FollowButton } from '@features/follow-button/follow-button'
import { ProfileHeader } from '@features/profile-header/profile-header'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/tabs'
import { USER_PAGE_TAB_QUERY_PARAM, USER_PAGE_TABS } from '@widgets/user-page/user-page-tabs'
import { UserPageSkeleton } from '@widgets/user-page/user-page-skeleton'

type UserPageProps = {
    handle: string
    initialUserId: string | null
    isAvailable: boolean
}

export const UserPage: FC<UserPageProps> = ({ handle, initialUserId, isAvailable }) => {
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const t = useTranslations()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const profileQuery = useProfile(handle, isAvailable && isAligned)
    const toggleFollow = useToggleFollow(handle)
    const searchParams = useSearchParams()
    const activeTab = USER_PAGE_TABS.find((tab) => tab.id === searchParams.get(USER_PAGE_TAB_QUERY_PARAM)) ?? USER_PAGE_TABS[0]

    if (!isAligned) return <UserPageSkeleton />

    if (!isAvailable || profileQuery.isError) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{isAvailable ? t('profile.loadErrorTitle') : t('profile.unavailableTitle')}</EmptyTitle>
                    <EmptyDescription>{isAvailable ? t('profile.loadErrorDescription') : t('profile.unavailableDescription')}</EmptyDescription>
                </EmptyHeader>
                {isAvailable ? (
                    <Button variant='outline' size='sm' disabled={profileQuery.isFetching} onClick={() => void profileQuery.refetch()}>
                        {t('common.retry')}
                    </Button>
                ) : (
                    <Button variant='outline' size='sm' asChild>
                        <Link href='/'>{t('navigation.home')}</Link>
                    </Button>
                )}
            </Empty>
        )
    }

    if (!profileQuery.data) return <UserPageSkeleton />

    const profile = profileQuery.data
    const handleToggleFollow = () => {
        if (viewerId === null) {
            setIsAuthDialogOpen(true)
            return
        }

        toggleFollow.mutate(!profile.isFollowing)
    }

    const handleTabChange = (tabId: string) => {
        const nextParams = new URLSearchParams(searchParams.toString())

        if (tabId === USER_PAGE_TABS[0].id) nextParams.delete(USER_PAGE_TAB_QUERY_PARAM)
        else nextParams.set(USER_PAGE_TAB_QUERY_PARAM, tabId)

        const query = nextParams.toString()

        window.history.pushState(null, '', query ? `?${query}` : window.location.pathname)
    }

    return (
        <>
            <ProfileHeader
                profile={profile}
                action={
                    profile.isOwner ? (
                        <Button variant='outline' size='sm' asChild>
                            <Link href='/settings'>{t('profile.openSettings')}</Link>
                        </Button>
                    ) : (
                        <FollowButton isFollowing={profile.isFollowing} isPending={toggleFollow.isPending} onToggle={handleToggleFollow} />
                    )
                }
            />
            <Tabs value={activeTab.id} onValueChange={handleTabChange} className='min-w-0 gap-0'>
                <div className='min-w-0 overflow-x-auto border-b border-border px-3 py-2'>
                    <TabsList variant='line' aria-label={t('profile.tabsLabel')}>
                        {USER_PAGE_TABS.map((tab) => (
                            <TabsTrigger key={tab.id} value={tab.id} className='flex-none px-2'>
                                {t(`profile.${tab.labelKey}`)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                {USER_PAGE_TABS.map(({ id, component: TabComponent }) => (
                    <TabsContent key={id} value={id} className='min-w-0'>
                        <TabComponent handle={handle} />
                    </TabsContent>
                ))}
            </Tabs>
            <AuthDialogWidget open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
        </>
    )
}

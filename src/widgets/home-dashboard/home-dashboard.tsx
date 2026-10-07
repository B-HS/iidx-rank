'use client'
import type { FC } from 'react'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { HomeDashboardSkeleton } from '@widgets/home-dashboard/home-dashboard-skeleton'
import { HomeGuestDashboard } from '@widgets/home-dashboard/home-guest-dashboard'
import { HomeMemberDashboard } from '@widgets/home-dashboard/home-member-dashboard'

type HomeDashboardProps = {
    initialUserId: string | null
}

export const HomeDashboard: FC<HomeDashboardProps> = ({ initialUserId }) => {
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)

    if (!isAligned) return <HomeDashboardSkeleton />
    if (viewerId === null) return <HomeGuestDashboard />

    return <HomeMemberDashboard userId={viewerId} />
}

import type { FC } from 'react'
import { DASHBOARD_GRID_CLASS_NAME } from '@shared/constants/dashboard'
import { HomeBoardPanel } from '@widgets/home-dashboard/home-board-panel'
import { HomeLampPanel } from '@widgets/home-dashboard/home-lamp-panel'
import { HomeProfilePanel } from '@widgets/home-dashboard/home-profile-panel'
import { HomeRadarPanel } from '@widgets/home-dashboard/home-radar-panel'
import { HomeRankPanel } from '@widgets/home-dashboard/home-rank-panel'
import { HomeRecentPanel } from '@widgets/home-dashboard/home-recent-panel'

type HomeMemberDashboardProps = {
    userId: string
}

export const HomeMemberDashboard: FC<HomeMemberDashboardProps> = ({ userId }) => (
    <div className={DASHBOARD_GRID_CLASS_NAME}>
        <HomeProfilePanel userId={userId} />
        <HomeRadarPanel />
        <HomeLampPanel userId={userId} />
        <HomeRankPanel userId={userId} />
        <HomeRecentPanel userId={userId} />
        <HomeBoardPanel userId={userId} />
    </div>
)

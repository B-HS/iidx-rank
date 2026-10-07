import type { FC } from 'react'
import { DASHBOARD_GRID_CLASS_NAME } from '@shared/constants/dashboard'
import { HomeGuestCompositionPanel } from '@widgets/home-dashboard/home-guest-composition-panel'
import { HomeGuestIntroPanel } from '@widgets/home-dashboard/home-guest-intro-panel'
import { HomeGuestPostsPanel } from '@widgets/home-dashboard/home-guest-posts-panel'
import { HomeGuestRankPanel } from '@widgets/home-dashboard/home-guest-rank-panel'
import { HomeGuestSourcePanel } from '@widgets/home-dashboard/home-guest-source-panel'

export const HomeGuestDashboard: FC = () => (
    <div className={DASHBOARD_GRID_CLASS_NAME}>
        <HomeGuestIntroPanel />
        <HomeGuestSourcePanel />
        <HomeGuestCompositionPanel />
        <HomeGuestRankPanel />
        <HomeGuestPostsPanel kind='notices' />
        <HomeGuestPostsPanel kind='posts' />
    </div>
)

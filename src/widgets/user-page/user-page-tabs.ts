import type { FC } from 'react'
import type { Messages } from 'next-intl'
import { UserPageOverviewTab } from '@widgets/user-page/user-page-overview-tab'
import { UserPageRecordsTab } from '@widgets/user-page/user-page-records-tab'

export const USER_PAGE_TAB_QUERY_PARAM = 'tab'

export type UserPageTabProps = {
    handle: string
}

export type UserPageTab = {
    id: string
    labelKey: Extract<keyof Messages['profile'], `tab${string}`>
    component: FC<UserPageTabProps>
}

export const USER_PAGE_TABS: readonly [UserPageTab, ...UserPageTab[]] = [
    { id: 'overview', labelKey: 'tabOverview', component: UserPageOverviewTab },
    { id: 'records', labelKey: 'tabRecords', component: UserPageRecordsTab },
]

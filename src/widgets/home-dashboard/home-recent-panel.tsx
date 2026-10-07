'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { getRecentRecords } from '@entities/dashboard/dashboard-summary'
import { getProfilePathname } from '@entities/profile/profile-page'
import { useMyProfile } from '@entities/profile/profile.query'
import { RecentRecordRow } from '@features/dashboard-activity/recent-record-row'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { FittedRowList } from '@features/fitted-row-list/fitted-row-list'
import { DASHBOARD_RECENT_LIST_CLASS_NAME, DASHBOARD_RECENT_RECORDS_LIMIT, DASHBOARD_WIDE_PANEL_CLASS_NAME } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'
import { HomeRecordsPanel } from '@widgets/home-dashboard/home-records-panel'

type HomeRecentPanelProps = {
    userId: string
}

const TABLE_PATHNAME = '/table'
const PROFILE_RECORDS_QUERY = { tab: 'records' } as const

export const HomeRecentPanel: FC<HomeRecentPanelProps> = ({ userId }) => {
    const t = useTranslations()
    const myProfileQuery = useMyProfile(true)
    const handle = myProfileQuery.data?.userId === userId ? myProfileQuery.data.handle : null

    return (
        <HomeRecordsPanel
            userId={userId}
            title={t('home.recentTitle')}
            className={DASHBOARD_WIDE_PANEL_CLASS_NAME}
            bodyClassName='p-0'
            loadingClassName='mx-3 mb-3'
            actions={
                <DashboardPanelLink href={handle ? { pathname: getProfilePathname(handle), query: PROFILE_RECORDS_QUERY } : TABLE_PATHNAME}>
                    {t('home.viewAll')}
                </DashboardPanelLink>
            }>
            {(charts, records) => {
                const recentRecords = getRecentRecords(charts, records, DASHBOARD_RECENT_RECORDS_LIMIT)

                if (recentRecords.length === 0) {
                    return (
                        <DashboardPanelEmpty message={t('profile.recordsEmptyDescription')}>
                            <DashboardPanelLink href={TABLE_PATHNAME} variant='outline'>
                                {t('navigation.checker')}
                            </DashboardPanelLink>
                        </DashboardPanelEmpty>
                    )
                }

                return (
                    <FittedRowList
                        label={t('home.recentTitle')}
                        className={cn('border-t border-border', DASHBOARD_RECENT_LIST_CLASS_NAME)}
                        rowClassName='h-10 border-b border-border'
                        rows={recentRecords.map((record) => ({ id: record.chartId, content: <RecentRecordRow record={record} /> }))}
                    />
                )
            }}
        </HomeRecordsPanel>
    )
}

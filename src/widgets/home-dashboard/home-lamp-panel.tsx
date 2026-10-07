'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { getLampSummary, getScoreGradeDistribution } from '@entities/dashboard/dashboard-summary'
import { LampDistribution } from '@features/dashboard-lamp/lamp-distribution'
import { ScoreGradeChart } from '@features/dashboard-lamp/score-grade-chart'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { DASHBOARD_GRADE_CHART_CLASS_NAME } from '@shared/constants/dashboard'
import { HomeRecordsPanel } from '@widgets/home-dashboard/home-records-panel'

type HomeLampPanelProps = {
    userId: string
}

export const HomeLampPanel: FC<HomeLampPanelProps> = ({ userId }) => {
    const t = useTranslations()

    return (
        <HomeRecordsPanel
            userId={userId}
            title={t('home.lampTitle')}
            bodyClassName='gap-2'
            actions={<DashboardPanelLink href='/table'>{t('navigation.checker')}</DashboardPanelLink>}>
            {(charts, records) => (
                <>
                    <LampDistribution summary={getLampSummary(charts, records)} />
                    <ScoreGradeChart distribution={getScoreGradeDistribution(charts, records)} className={DASHBOARD_GRADE_CHART_CLASS_NAME} />
                </>
            )}
        </HomeRecordsPanel>
    )
}

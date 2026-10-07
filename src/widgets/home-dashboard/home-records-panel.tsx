'use client'
import type { ComponentProps, FC, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { Chart } from '@entities/catalog/catalog.dto'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { useDashboardRecords } from '@entities/dashboard/dashboard.query'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'

type HomeRecordsPanelProps = Omit<ComponentProps<typeof DashboardPanel>, 'children'> & {
    userId: string
    loadingClassName?: string
    children: (charts: Chart[], records: ChartRecord[]) => ReactNode
}

export const HomeRecordsPanel: FC<HomeRecordsPanelProps> = ({ userId, loadingClassName, children, ...panelProps }) => {
    const t = useTranslations('checker')
    const { charts, records, isError, isRetrying, retry } = useDashboardRecords(userId)
    const isLoaded = charts !== undefined && records !== undefined

    return (
        <DashboardPanel {...panelProps}>
            {isError && <DashboardPanelError message={t('recordLoadErrorTitle')} isRetrying={isRetrying} onRetry={retry} />}
            {!isError && !isLoaded && <DashboardPanelLoading label={t('loadingRecords')} className={loadingClassName} />}
            {!isError && isLoaded && charts.length === 0 && <DashboardPanelEmpty message={t('emptyCatalogTitle')} />}
            {!isError && isLoaded && charts.length > 0 && children(charts, records)}
        </DashboardPanel>
    )
}

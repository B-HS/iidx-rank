'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useImportStatus } from '@entities/eamusement/eamusement.query'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'
import { NotesRadarChart } from '@features/notes-radar-chart/notes-radar-chart'
import { NotesRadarList } from '@features/notes-radar-list/notes-radar-list'
import { DASHBOARD_RADAR_BODY_CLASS_NAME } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

export const HomeRadarPanel: FC = () => {
    const t = useTranslations('settings')
    const statusQuery = useImportStatus(true)
    const notesRadar = statusQuery.data?.latest?.notesRadar
    const isFailed = !statusQuery.data && statusQuery.isError

    return (
        <DashboardPanel title={t('eamusementRadarTitle')}>
            {isFailed && (
                <DashboardPanelError
                    message={t('eamusementStatusLoadError')}
                    isRetrying={statusQuery.isFetching}
                    onRetry={() => void statusQuery.refetch()}
                />
            )}
            {!isFailed && !statusQuery.data && <DashboardPanelLoading label={t('eamusementStatusLoading')} />}
            {statusQuery.data && !notesRadar && <DashboardPanelEmpty message={t('eamusementRadarEmpty')} />}
            {notesRadar && (
                <div className={cn('flex min-w-0 items-center justify-center gap-4 [container-type:size]', DASHBOARD_RADAR_BODY_CLASS_NAME)}>
                    <NotesRadarChart notesRadar={notesRadar} className='size-[min(100cqh,56cqw)] shrink-0' />
                    <NotesRadarList notesRadar={notesRadar} className='grid max-w-44 min-w-0 flex-1 gap-1.5 text-xs' />
                </div>
            )}
        </DashboardPanel>
    )
}

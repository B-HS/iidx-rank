'use client'
import type { ComponentProps, FC, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import type { Catalog } from '@entities/catalog/catalog.dto'
import { useDashboardCatalog } from '@entities/dashboard/dashboard.query'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelEmpty } from '@features/dashboard-panel/dashboard-panel-empty'
import { DashboardPanelError } from '@features/dashboard-panel/dashboard-panel-error'
import { DashboardPanelLoading } from '@features/dashboard-panel/dashboard-panel-loading'

type HomeCatalogPanelProps = Omit<ComponentProps<typeof DashboardPanel>, 'children'> & {
    children: (catalog: Catalog) => ReactNode
}

export const HomeCatalogPanel: FC<HomeCatalogPanelProps> = ({ children, ...panelProps }) => {
    const t = useTranslations()
    const catalogQuery = useDashboardCatalog()
    const catalog = catalogQuery.data
    const isFailed = !catalog && catalogQuery.isError

    return (
        <DashboardPanel {...panelProps}>
            {isFailed && (
                <DashboardPanelError
                    message={t('home.catalogLoadError')}
                    isRetrying={catalogQuery.isFetching}
                    onRetry={() => void catalogQuery.refetch()}
                />
            )}
            {!isFailed && !catalog && <DashboardPanelLoading label={t('home.catalogLoading')} />}
            {catalog && catalog.charts.length === 0 && <DashboardPanelEmpty message={t('checker.emptyCatalogTitle')} />}
            {catalog && catalog.charts.length > 0 && children(catalog)}
        </DashboardPanel>
    )
}

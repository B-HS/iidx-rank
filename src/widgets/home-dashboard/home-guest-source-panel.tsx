'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { CatalogSourceSummary } from '@features/catalog-source-summary/catalog-source-summary'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { HomeCatalogPanel } from '@widgets/home-dashboard/home-catalog-panel'

export const HomeGuestSourcePanel: FC = () => {
    const t = useTranslations()

    return (
        <HomeCatalogPanel title={t('home.sourceTitle')} actions={<DashboardPanelLink href='/table'>{t('home.openTable')}</DashboardPanelLink>}>
            {(catalog) => <CatalogSourceSummary source={catalog.source} versionCount={new Set(catalog.charts.map((chart) => chart.version)).size} />}
        </HomeCatalogPanel>
    )
}

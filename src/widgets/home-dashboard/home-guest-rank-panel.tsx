'use client'
import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { type Chart, RANKS } from '@entities/catalog/catalog.dto'
import { BarCountList } from '@features/bar-count-list/bar-count-list'
import { HomeCatalogPanel } from '@widgets/home-dashboard/home-catalog-panel'

const RANK_ORDER = RANKS.toReversed()

export const HomeGuestRankPanel: FC = () => {
    const t = useTranslations()
    const locale = useLocale()
    const toItems = (ranks: readonly Chart['normalRank'][]) => {
        const counts = RANK_ORDER.map((rank) => ({ rank, count: ranks.filter((chartRank) => chartRank === rank).length }))
        const maxCount = Math.max(...counts.map(({ count }) => count), 1)

        return counts.map(({ rank, count }) => ({
            id: rank,
            label: rank,
            ratio: count / maxCount,
            value: count.toLocaleString(locale),
            isMuted: count === 0,
        }))
    }

    return (
        <HomeCatalogPanel title={t('home.rankCountTitle')}>
            {({ charts }) => (
                <div className='grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-4'>
                    <BarCountList title={t('checker.normalModeShort')} items={toItems(charts.map((chart) => chart.normalRank))} />
                    <BarCountList title={t('checker.hardModeShort')} items={toItems(charts.map((chart) => chart.hardRank))} />
                </div>
            )}
        </HomeCatalogPanel>
    )
}

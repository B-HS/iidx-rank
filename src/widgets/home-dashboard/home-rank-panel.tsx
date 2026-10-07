'use client'
import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { getRankPlayCounts, type RankPlaySection } from '@entities/dashboard/dashboard-summary'
import { BarCountList } from '@features/bar-count-list/bar-count-list'
import { HomeRecordsPanel } from '@widgets/home-dashboard/home-records-panel'

type HomeRankPanelProps = {
    userId: string
}

const sumBy = (sections: readonly RankPlaySection[], key: 'played' | 'total') => sections.reduce((sum, section) => sum + section[key], 0)

export const HomeRankPanel: FC<HomeRankPanelProps> = ({ userId }) => {
    const t = useTranslations('home')
    const locale = useLocale()
    const formatFraction = (played: number, total: number) => `${played.toLocaleString(locale)}/${total.toLocaleString(locale)}`
    const toListProps = (sections: readonly RankPlaySection[]) => {
        const rankedSections = sections.flatMap((section) => (section.rank === null ? [] : [{ ...section, rank: section.rank }]))

        return {
            summary: formatFraction(sumBy(rankedSections, 'played'), sumBy(rankedSections, 'total')),
            items: rankedSections.map(({ rank, played, total }) => ({
                id: rank,
                label: rank,
                ratio: total === 0 ? 0 : played / total,
                value: formatFraction(played, total),
                isMuted: played === 0,
            })),
        }
    }

    return (
        <HomeRecordsPanel userId={userId} title={t('rankTitle')}>
            {(charts, records) => {
                const playCounts = getRankPlayCounts(charts, records)

                return (
                    <div className='grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-4'>
                        <BarCountList title={t('rankNormalTitle')} {...toListProps(playCounts.normal)} />
                        <BarCountList title={t('rankHardTitle')} {...toListProps(playCounts.hard)} />
                    </div>
                )
            }}
        </HomeRecordsPanel>
    )
}

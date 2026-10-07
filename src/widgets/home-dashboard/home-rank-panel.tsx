'use client'
import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { getRankAchievement, type RankAchievementSection } from '@entities/dashboard/dashboard-summary'
import { BarCountList } from '@features/bar-count-list/bar-count-list'
import { HomeRecordsPanel } from '@widgets/home-dashboard/home-records-panel'

type HomeRankPanelProps = {
    userId: string
}

const sumBy = (sections: readonly RankAchievementSection[], key: 'achieved' | 'total') => sections.reduce((sum, section) => sum + section[key], 0)

export const HomeRankPanel: FC<HomeRankPanelProps> = ({ userId }) => {
    const t = useTranslations('home')
    const locale = useLocale()
    const formatFraction = (achieved: number, total: number) => `${achieved.toLocaleString(locale)}/${total.toLocaleString(locale)}`
    const toListProps = (sections: readonly RankAchievementSection[]) => {
        const rankedSections = sections.flatMap((section) => (section.rank === null ? [] : [{ ...section, rank: section.rank }]))

        return {
            summary: formatFraction(sumBy(rankedSections, 'achieved'), sumBy(rankedSections, 'total')),
            items: rankedSections.map(({ rank, achieved, total }) => ({
                id: rank,
                label: rank,
                ratio: total === 0 ? 0 : achieved / total,
                value: formatFraction(achieved, total),
                isMuted: achieved === 0,
            })),
        }
    }

    return (
        <HomeRecordsPanel userId={userId} title={t('rankTitle')}>
            {(charts, records) => {
                const achievement = getRankAchievement(charts, records)

                return (
                    <div className='grid min-h-0 min-w-0 flex-1 grid-cols-2 gap-4'>
                        <BarCountList title={t('rankNormalTitle')} {...toListProps(achievement.normal)} />
                        <BarCountList title={t('rankHardTitle')} {...toListProps(achievement.hard)} />
                    </div>
                )
            }}
        </HomeRecordsPanel>
    )
}

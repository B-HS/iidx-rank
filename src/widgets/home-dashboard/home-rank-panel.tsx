'use client'
import { type ComponentProps, type FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getRankLampDistribution } from '@entities/dashboard/dashboard-summary'
import { CheckerModeToggle } from '@features/checker-mode-toggle/checker-mode-toggle'
import { RankLampList } from '@features/dashboard-lamp/rank-lamp-list'
import { HomeRecordsPanel } from '@widgets/home-dashboard/home-records-panel'

type HomeRankPanelProps = {
    userId: string
}

type RankMode = ComponentProps<typeof CheckerModeToggle>['value']

const RANK_MODE_TITLE_KEYS = { normal: 'rankNormalTitle', hard: 'rankHardTitle' } as const

export const HomeRankPanel: FC<HomeRankPanelProps> = ({ userId }) => {
    const [mode, setMode] = useState<RankMode>('hard')
    const t = useTranslations('home')

    return (
        <HomeRecordsPanel userId={userId} title={t('rankTitle')} actions={<CheckerModeToggle value={mode} onValueChange={setMode} />}>
            {(charts, records) => <RankLampList title={t(RANK_MODE_TITLE_KEYS[mode])} sections={getRankLampDistribution(charts, records)[mode]} />}
        </HomeRecordsPanel>
    )
}

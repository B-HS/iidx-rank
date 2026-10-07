'use client'
import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { DIFFICULTIES } from '@entities/catalog/catalog.dto'
import { BarCountList } from '@features/bar-count-list/bar-count-list'
import { HomeCatalogPanel } from '@widgets/home-dashboard/home-catalog-panel'

const LABEL_CLASS_NAME = 'w-24'

export const HomeGuestCompositionPanel: FC = () => {
    const t = useTranslations()
    const locale = useLocale()
    const toItem = (id: string, label: string, count: number, total: number) => ({
        id,
        label,
        ratio: total === 0 ? 0 : count / total,
        value: count.toLocaleString(locale),
        isMuted: count === 0,
    })

    return (
        <HomeCatalogPanel title={t('home.compositionTitle')} bodyClassName='gap-3'>
            {({ charts }) => (
                <>
                    <BarCountList
                        title={t('checker.difficultyLabel')}
                        labelClassName={LABEL_CLASS_NAME}
                        className='flex-[3]'
                        items={DIFFICULTIES.map((difficulty) =>
                            toItem(
                                difficulty,
                                t(`difficulty.${difficulty}`),
                                charts.filter((chart) => chart.difficulty === difficulty).length,
                                charts.length,
                            ),
                        )}
                    />
                    <BarCountList
                        title={t('checker.personalCharts')}
                        labelClassName={LABEL_CLASS_NAME}
                        className='flex-[2]'
                        items={[
                            toItem('normal', t('checker.normalModeShort'), charts.filter((chart) => chart.normalPersonal).length, charts.length),
                            toItem('hard', t('checker.hardModeShort'), charts.filter((chart) => chart.hardPersonal).length, charts.length),
                        ]}
                    />
                </>
            )}
        </HomeCatalogPanel>
    )
}

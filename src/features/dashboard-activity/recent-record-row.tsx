import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { RecentRecord } from '@entities/dashboard/dashboard-summary'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { CHART_LAMP_WIDTH_PX } from '@shared/constants/checker'
import { DIFFICULTY_COLORS, LAMP_STATIC_BACKGROUNDS } from '@shared/constants/dashboard'

type RecentRecordRowProps = {
    record: Pick<RecentRecord, 'title' | 'difficulty' | 'version' | 'lamp' | 'scoreGrade' | 'exScore' | 'updatedAt'>
}

export const RecentRecordRow: FC<RecentRecordRowProps> = ({ record }) => {
    const t = useTranslations()
    const locale = useLocale()

    return (
        <div className='flex h-full min-w-0 items-stretch gap-2 pr-3'>
            <span
                aria-hidden='true'
                className='box-content shrink-0'
                style={{
                    width: CHART_LAMP_WIDTH_PX,
                    background: LAMP_STATIC_BACKGROUNDS[record.lamp],
                    borderLeft: `var(--checker-difficulty-border-width) solid ${DIFFICULTY_COLORS[record.difficulty]}`,
                    boxShadow: '1px 0 0 0 color-mix(in oklch, var(--foreground) 45%, transparent)',
                }}
            />
            <div className='grid min-w-0 flex-1 content-center'>
                <p className='truncate text-xs leading-4 font-medium' title={record.title}>
                    {record.title}
                </p>
                <p className='truncate text-2xs leading-4 text-muted-foreground'>
                    {t(`difficulty.${record.difficulty}`)} · {record.version}
                </p>
            </div>
            <div className='grid shrink-0 content-center justify-items-end'>
                <p className='flex items-baseline gap-1.5 text-xs leading-4'>
                    <span className='font-medium'>{t(`lamp.${record.lamp}`)}</span>
                    {record.scoreGrade && (
                        <span className='font-semibold tabular-nums' title={t('checker.detailScoreGrade')}>
                            {record.scoreGrade}
                        </span>
                    )}
                </p>
                <p className='flex items-baseline gap-1.5 text-2xs leading-4 text-muted-foreground tabular-nums'>
                    {record.exScore !== null && (
                        <span title={t('checker.detailExScore')}>
                            {t('home.exScoreShort')} {record.exScore.toLocaleString(locale)}
                        </span>
                    )}
                    <BoardTimestamp value={record.updatedAt} isCompact />
                </p>
            </div>
        </div>
    )
}

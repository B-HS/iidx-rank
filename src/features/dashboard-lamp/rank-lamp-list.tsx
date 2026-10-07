import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { RankLampSection } from '@entities/dashboard/dashboard-summary'
import { LampSwatch } from '@features/lamp-swatch/lamp-swatch'
import { BAR_COUNT_ROW_MAX_HEIGHT_REM, LAMP_STATIC_BACKGROUNDS } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

type RankLampListProps = {
    title: string
    sections: readonly RankLampSection[]
    className?: string
}

export const RankLampList: FC<RankLampListProps> = ({ title, sections, className }) => {
    const t = useTranslations()
    const locale = useLocale()
    const rows = sections.flatMap((section) => (section.rank === null ? [] : [{ ...section, rank: section.rank, lamps: section.lamps.toReversed() }]))
    const formatCount = (count: number) => count.toLocaleString(locale)
    const playedTotal = rows.reduce((sum, row) => sum + row.played, 0)
    const chartTotal = rows.reduce((sum, row) => sum + row.total, 0)
    const legendLamps = rows[0]?.lamps.map(({ lamp }) => lamp) ?? []

    return (
        <section className={cn('flex min-h-0 min-w-0 flex-1 flex-col gap-1', className)}>
            <div className='flex min-w-0 shrink-0 items-baseline justify-between gap-2'>
                <h3 className='checker-micro-label truncate'>{title}</h3>
                <p className='shrink-0 text-2xs font-medium tabular-nums'>
                    {t('home.rankPlayedSummary', { played: formatCount(playedTotal), total: formatCount(chartTotal) })}
                </p>
            </div>
            <ol
                className='grid min-h-0 min-w-0 flex-1'
                style={{
                    gridTemplateRows: `repeat(${rows.length}, minmax(1rem, 1fr))`,
                    maxHeight: `${rows.length * BAR_COUNT_ROW_MAX_HEIGHT_REM}rem`,
                }}>
                {rows.map(({ rank, total, played, lamps }) => (
                    <li key={rank} className='flex min-w-0 items-center gap-1.5 text-2xs leading-none'>
                        <span className='w-7 shrink-0 truncate font-medium'>{rank}</span>
                        <span
                            role='img'
                            aria-label={lamps.map(({ lamp, count }) => `${t(`lamp.${lamp}`)} ${formatCount(count)}`).join(', ')}
                            className='flex h-1/2 max-h-3.5 min-h-2 min-w-0 flex-1 gap-px overflow-hidden bg-foreground/40 p-px'>
                            {lamps
                                .filter(({ count }) => count > 0)
                                .map(({ lamp, count }) => (
                                    <span
                                        key={lamp}
                                        title={`${t(`lamp.${lamp}`)} ${formatCount(count)}`}
                                        className='min-w-0.5 basis-0'
                                        style={{ flexGrow: count, background: LAMP_STATIC_BACKGROUNDS[lamp] }}
                                    />
                                ))}
                        </span>
                        <span className={cn('min-w-12 shrink-0 text-right tabular-nums', played === 0 && 'text-muted-foreground')}>
                            {formatCount(played)}/{formatCount(total)}
                        </span>
                    </li>
                ))}
            </ol>
            <ul className='flex min-w-0 shrink-0 flex-wrap gap-x-2.5 gap-y-0.5 text-2xs text-muted-foreground'>
                {legendLamps.map((lamp) => (
                    <li key={lamp} className='flex items-center gap-1'>
                        <LampSwatch lamp={lamp} className='size-2' />
                        {t(`lamp.${lamp}`)}
                    </li>
                ))}
            </ul>
        </section>
    )
}

import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { LampSummary } from '@entities/dashboard/dashboard-summary'
import { LampSwatch } from '@features/lamp-swatch/lamp-swatch'
import { LAMP_STATIC_BACKGROUNDS, PERCENT_SCALE } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

type LampDistributionProps = {
    summary: LampSummary
}

export const LampDistribution: FC<LampDistributionProps> = ({ summary }) => {
    const t = useTranslations()
    const locale = useLocale()
    const lamps = summary.lamps.toReversed()
    const playedPercent = summary.total === 0 ? 0 : Math.round((summary.played / summary.total) * PERCENT_SCALE)
    const barLabel = lamps.map(({ lamp, count }) => `${t(`lamp.${lamp}`)} ${count.toLocaleString(locale)}`).join(', ')

    return (
        <div className='grid min-w-0 shrink-0 gap-2'>
            <dl className='flex min-w-0 items-end justify-between gap-3'>
                <div className='flex min-w-0 items-baseline gap-2'>
                    <dt className='shrink-0 text-xs text-muted-foreground'>{t('home.playedCharts')}</dt>
                    <dd className='min-w-0 truncate tabular-nums'>
                        <span className='text-xl leading-7 font-semibold tracking-tight'>{summary.played.toLocaleString(locale)}</span>
                        <span className='text-xs text-muted-foreground'> / {summary.total.toLocaleString(locale)}</span>
                    </dd>
                </div>
                <div className='flex shrink-0 items-baseline gap-1.5'>
                    <dt className='text-xs text-muted-foreground'>{t('home.playedRate')}</dt>
                    <dd className='text-sm font-semibold tabular-nums'>{playedPercent}%</dd>
                </div>
            </dl>
            <div role='img' aria-label={barLabel} className='flex h-3 min-w-0 gap-px overflow-hidden bg-foreground/40 p-px'>
                {lamps
                    .filter(({ count }) => count > 0)
                    .map(({ lamp, count }) => (
                        <span
                            key={lamp}
                            title={`${t(`lamp.${lamp}`)} ${count.toLocaleString(locale)}`}
                            className='min-w-0.5 basis-0'
                            style={{ flexGrow: count, background: LAMP_STATIC_BACKGROUNDS[lamp] }}
                        />
                    ))}
            </div>
            <ul className='grid min-w-0 grid-cols-2 gap-x-4 gap-y-0.5 text-xs'>
                {lamps.map(({ lamp, count }) => (
                    <li key={lamp} className='flex min-w-0 items-center justify-between gap-2'>
                        <span className='flex min-w-0 items-center gap-1.5'>
                            <LampSwatch lamp={lamp} />
                            <span className='truncate'>{t(`lamp.${lamp}`)}</span>
                        </span>
                        <span className={cn('shrink-0 tabular-nums', count === 0 ? 'text-muted-foreground' : 'font-medium')}>
                            {count.toLocaleString(locale)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

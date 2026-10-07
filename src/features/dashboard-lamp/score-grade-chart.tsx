import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ScoreGradeDistribution } from '@entities/dashboard/dashboard-summary'
import { PERCENT_SCALE } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

type ScoreGradeChartProps = {
    distribution: ScoreGradeDistribution
    className?: string
}

export const ScoreGradeChart: FC<ScoreGradeChartProps> = ({ distribution, className }) => {
    const t = useTranslations('home')
    const locale = useLocale()
    const maxCount = Math.max(...distribution.map(({ count }) => count), 1)

    return (
        <section className={cn('flex min-h-0 min-w-0 flex-col gap-1 overflow-hidden', className)}>
            <h3 className='checker-micro-label shrink-0'>{t('scoreGradeTitle')}</h3>
            <ol className='grid min-h-0 min-w-0 flex-1 gap-1' style={{ gridTemplateColumns: `repeat(${distribution.length}, minmax(0, 1fr))` }}>
                {distribution.map(({ grade, count }) => (
                    <li key={grade} className='flex min-h-0 min-w-0 flex-col items-center justify-end gap-0.5'>
                        <span aria-hidden='true' className='flex min-h-0 w-full flex-1 items-end bg-muted/50'>
                            <span className='block w-full bg-muted-foreground/70' style={{ height: `${(count / maxCount) * PERCENT_SCALE}%` }} />
                        </span>
                        <span className={cn('text-xs leading-none tabular-nums', count === 0 ? 'text-muted-foreground' : 'font-medium')}>
                            {count.toLocaleString(locale)}
                        </span>
                        <span className='text-2xs leading-none text-muted-foreground'>{grade}</span>
                    </li>
                ))}
            </ol>
        </section>
    )
}

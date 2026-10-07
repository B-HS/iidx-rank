import type { FC } from 'react'
import { BAR_COUNT_ROW_MAX_HEIGHT_REM, PERCENT_SCALE } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

type BarCountListProps = {
    title: string
    summary?: string
    items: readonly { id: string; label: string; ratio: number; value: string; isMuted: boolean }[]
    labelClassName?: string
    className?: string
}

export const BarCountList: FC<BarCountListProps> = ({ title, summary, items, labelClassName = 'w-7', className }) => (
    <section className={cn('flex min-h-0 min-w-0 flex-col gap-1', className)}>
        <div className='flex min-w-0 shrink-0 items-baseline justify-between gap-2'>
            <h3 className='checker-micro-label truncate'>{title}</h3>
            {summary ? <p className='shrink-0 text-2xs font-medium tabular-nums'>{summary}</p> : null}
        </div>
        <ol
            className='grid min-h-0 min-w-0 flex-1'
            style={{
                gridTemplateRows: `repeat(${items.length}, minmax(1rem, 1fr))`,
                maxHeight: `${items.length * BAR_COUNT_ROW_MAX_HEIGHT_REM}rem`,
            }}>
            {items.map(({ id, label, ratio, value, isMuted }) => (
                <li key={id} className='flex min-w-0 items-center gap-1.5 text-2xs leading-none'>
                    <span className={cn('shrink-0 truncate font-medium', labelClassName)}>{label}</span>
                    <span aria-hidden='true' className='block h-2/5 max-h-3 min-h-1.5 min-w-0 flex-1 bg-muted'>
                        <span className='block h-full bg-primary' style={{ width: `${Math.min(Math.max(ratio, 0), 1) * PERCENT_SCALE}%` }} />
                    </span>
                    <span className={cn('min-w-12 shrink-0 text-right tabular-nums', isMuted && 'text-muted-foreground')}>{value}</span>
                </li>
            ))}
        </ol>
    </section>
)

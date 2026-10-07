import type { FC } from 'react'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { LAMP_STATIC_BACKGROUNDS } from '@shared/constants/dashboard'
import { cn } from '@shared/lib/utils'

type LampSwatchProps = {
    lamp: ChartRecord['lamp']
    className?: string
}

export const LampSwatch: FC<LampSwatchProps> = ({ lamp, className }) => (
    <span
        aria-hidden='true'
        className={cn('inline-block size-2.5 shrink-0 border border-foreground/40', className)}
        style={{ background: LAMP_STATIC_BACKGROUNDS[lamp] }}
    />
)

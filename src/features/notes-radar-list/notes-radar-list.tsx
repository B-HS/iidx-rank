import type { FC } from 'react'
import { useLocale } from 'next-intl'
import { NOTES_RADAR_AXES, type NotesRadar } from '@entities/eamusement/eamusement.dto'
import { EMPTY_VALUE_PLACEHOLDER, NOTES_RADAR_FRACTION_DIGITS } from '@shared/constants/eamusement-display'

type NotesRadarListProps = {
    notesRadar: NotesRadar
    className?: string
}

export const NotesRadarList: FC<NotesRadarListProps> = ({ notesRadar, className }) => {
    const locale = useLocale()
    const numberFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: NOTES_RADAR_FRACTION_DIGITS,
        maximumFractionDigits: NOTES_RADAR_FRACTION_DIGITS,
    })

    return (
        <dl className={className ?? 'grid min-w-0 grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-3'}>
            {NOTES_RADAR_AXES.map((axis) => (
                <div key={axis} className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='text-muted-foreground'>{axis}</dt>
                    <dd className='font-medium tabular-nums'>
                        {notesRadar[axis] === null ? EMPTY_VALUE_PLACEHOLDER : numberFormat.format(notesRadar[axis])}
                    </dd>
                </div>
            ))}
        </dl>
    )
}

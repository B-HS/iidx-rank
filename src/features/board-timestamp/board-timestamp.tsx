import type { FC } from 'react'
import { useLocale } from 'next-intl'

type BoardTimestampProps = {
    value: string
    isCompact?: boolean
    className?: string
}

const BOARD_TIME_ZONE = 'Asia/Tokyo'
const FULL_FORMAT_OPTIONS = { dateStyle: 'medium', timeStyle: 'short', timeZone: BOARD_TIME_ZONE } as const
const COMPACT_FORMAT_OPTIONS = {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: BOARD_TIME_ZONE,
} as const

export const BoardTimestamp: FC<BoardTimestampProps> = ({ value, isCompact = false, className }) => {
    const locale = useLocale()
    const date = new Date(value)
    const fullText = new Intl.DateTimeFormat(locale, FULL_FORMAT_OPTIONS).format(date)

    return (
        <time dateTime={value} title={isCompact ? fullText : undefined} className={className}>
            {isCompact ? new Intl.DateTimeFormat(locale, COMPACT_FORMAT_OPTIONS).format(date) : fullText}
        </time>
    )
}

import type { FC } from 'react'
import { useLocale } from 'next-intl'

type BoardTimestampProps = {
    value: string
    className?: string
}

const BOARD_TIME_ZONE = 'Asia/Tokyo'

export const BoardTimestamp: FC<BoardTimestampProps> = ({ value, className }) => {
    const locale = useLocale()

    return (
        <time dateTime={value} className={className}>
            {new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: BOARD_TIME_ZONE }).format(new Date(value))}
        </time>
    )
}

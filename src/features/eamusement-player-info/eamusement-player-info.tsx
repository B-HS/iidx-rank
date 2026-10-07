import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ImportStatus } from '@entities/eamusement/eamusement.dto'
import { DJ_POINT_FRACTION_DIGITS, EMPTY_VALUE_PLACEHOLDER } from '@shared/constants/eamusement-display'

type EamusementPlayerInfoProps = {
    player: ImportStatus['player']
}

export const EamusementPlayerInfo: FC<EamusementPlayerInfoProps> = ({ player }) => {
    const t = useTranslations('settings')
    const locale = useLocale()
    const countFormat = new Intl.NumberFormat(locale)
    const djPointFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: DJ_POINT_FRACTION_DIGITS,
        maximumFractionDigits: DJ_POINT_FRACTION_DIGITS,
    })
    const formatCount = (count: number | null) => (count === null ? EMPTY_VALUE_PLACEHOLDER : countFormat.format(count))
    const rows = [
        { id: 'djName', label: t('eamusementDjName'), value: player.djName ?? EMPTY_VALUE_PLACEHOLDER },
        { id: 'iidxId', label: t('eamusementIidxId'), value: player.iidxId ?? EMPTY_VALUE_PLACEHOLDER },
        { id: 'danRank', label: t('eamusementDanRank'), value: player.danRank ?? EMPTY_VALUE_PLACEHOLDER },
        {
            id: 'djPoint',
            label: t('eamusementDjPoint'),
            value: player.djPoint === null ? EMPTY_VALUE_PLACEHOLDER : djPointFormat.format(player.djPoint),
        },
        {
            id: 'playCount',
            label: t('eamusementPlayCount'),
            value: t('eamusementPlayCountValue', { sp: formatCount(player.playCountSp), dp: formatCount(player.playCountDp) }),
        },
    ]

    return (
        <dl className='grid min-w-0 gap-1 text-xs sm:grid-cols-2'>
            {rows.map(({ id, label, value }) => (
                <div key={id} className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{label}</dt>
                    <dd className='min-w-0 break-words text-right font-medium tabular-nums'>{value}</dd>
                </div>
            ))}
        </dl>
    )
}

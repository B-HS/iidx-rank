import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ImportResult } from '@entities/eamusement/eamusement.dto'

type EamusementImportCountsProps = Pick<ImportResult, 'receivedCount' | 'matchedCount' | 'changedCount'>

export const EamusementImportCounts: FC<EamusementImportCountsProps> = ({ receivedCount, matchedCount, changedCount }) => {
    const t = useTranslations('settings')
    const locale = useLocale()
    const counts = [
        { id: 'received', label: t('eamusementReceivedCount'), value: receivedCount },
        { id: 'matched', label: t('eamusementMatchedCount'), value: matchedCount },
        { id: 'changed', label: t('eamusementChangedCount'), value: changedCount },
    ]

    return (
        <dl className='grid min-w-0 grid-cols-3 gap-2 text-xs'>
            {counts.map(({ id, label, value }) => (
                <div key={id} className='grid min-w-0 gap-0.5 border border-border p-2'>
                    <dt className='truncate text-muted-foreground'>{label}</dt>
                    <dd className='text-sm font-semibold tabular-nums'>{value.toLocaleString(locale)}</dd>
                </div>
            ))}
        </dl>
    )
}

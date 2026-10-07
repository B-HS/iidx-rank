import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ImportStatus } from '@entities/eamusement/eamusement.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'

type DashboardImportSummaryProps = {
    status: Pick<ImportStatus, 'importedAt' | 'channel' | 'receivedCount' | 'matchedCount' | 'changedCount'>
}

const CHANNEL_LABEL_KEYS = { extension: 'eamusementChannelExtension', file: 'eamusementChannelFile' } as const satisfies Record<
    ImportStatus['channel'],
    string
>

export const DashboardImportSummary: FC<DashboardImportSummaryProps> = ({ status }) => {
    const t = useTranslations('settings')
    const tHome = useTranslations('home')
    const locale = useLocale()
    const items = [
        { id: 'channel', label: t('eamusementChannel'), value: t(CHANNEL_LABEL_KEYS[status.channel]) },
        { id: 'received', label: t('eamusementReceivedCount'), value: status.receivedCount.toLocaleString(locale) },
        { id: 'matched', label: t('eamusementMatchedCount'), value: status.matchedCount.toLocaleString(locale) },
        { id: 'changed', label: t('eamusementChangedCount'), value: status.changedCount.toLocaleString(locale) },
    ]

    return (
        <section className='grid min-w-0 shrink-0 gap-1 border-t border-border pt-2'>
            <div className='flex min-w-0 items-baseline justify-between gap-2'>
                <h3 className='checker-micro-label truncate'>{t('eamusementStatusTitle')}</h3>
                <p className='min-w-0 truncate text-2xs text-muted-foreground'>
                    {tHome('lastSynced')} <BoardTimestamp value={status.importedAt} className='font-medium text-foreground tabular-nums' />
                </p>
            </div>
            <dl className='grid min-w-0 grid-cols-4 gap-2'>
                {items.map(({ id, label, value }) => (
                    <div key={id} className='grid min-w-0 gap-0.5'>
                        <dt className='truncate text-2xs text-muted-foreground'>{label}</dt>
                        <dd className='truncate text-xs font-medium tabular-nums'>{value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    )
}

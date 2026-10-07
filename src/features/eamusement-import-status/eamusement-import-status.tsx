import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import type { ImportStatus } from '@entities/eamusement/eamusement.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { EamusementImportCounts } from '@features/eamusement-import-counts/eamusement-import-counts'

type EamusementImportStatusProps = {
    status: Pick<ImportStatus, 'importedAt' | 'channel' | 'receivedCount' | 'matchedCount' | 'changedCount'>
}

const CHANNEL_LABEL_KEYS = { extension: 'eamusementChannelExtension', file: 'eamusementChannelFile' } as const satisfies Record<
    ImportStatus['channel'],
    string
>

export const EamusementImportStatus: FC<EamusementImportStatusProps> = ({ status }) => {
    const t = useTranslations('settings')

    return (
        <div className='grid min-w-0 gap-3'>
            <dl className='grid min-w-0 gap-1 text-xs sm:grid-cols-2'>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='text-muted-foreground'>{t('eamusementImportedAt')}</dt>
                    <dd className='font-medium'>
                        <BoardTimestamp value={status.importedAt} />
                    </dd>
                </div>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='text-muted-foreground'>{t('eamusementChannel')}</dt>
                    <dd className='font-medium'>{t(CHANNEL_LABEL_KEYS[status.channel])}</dd>
                </div>
            </dl>
            <EamusementImportCounts receivedCount={status.receivedCount} matchedCount={status.matchedCount} changedCount={status.changedCount} />
        </div>
    )
}

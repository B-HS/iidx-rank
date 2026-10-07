import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import type { ProfileEamusement } from '@entities/profile/profile.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'
import { NotesRadarList } from '@features/notes-radar-list/notes-radar-list'
import { EMPTY_VALUE_PLACEHOLDER } from '@shared/constants/eamusement-display'

type ProfileEamusementSummaryProps = {
    eamusement: ProfileEamusement
}

export const ProfileEamusementSummary: FC<ProfileEamusementSummaryProps> = ({ eamusement }) => {
    const t = useTranslations('profile')

    return (
        <section className='grid min-w-0 gap-3 border-b border-border p-3'>
            <h3 className='checker-micro-label'>{t('eamusementTitle')}</h3>
            <dl className='grid min-w-0 max-w-xl gap-1 text-xs sm:grid-cols-2'>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('eamusementDjName')}</dt>
                    <dd className='min-w-0 break-words text-right font-medium'>{eamusement.djName ?? EMPTY_VALUE_PLACEHOLDER}</dd>
                </div>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('eamusementDanRank')}</dt>
                    <dd className='min-w-0 break-words text-right font-medium'>{eamusement.danRank ?? EMPTY_VALUE_PLACEHOLDER}</dd>
                </div>
                <div className='flex min-w-0 items-baseline justify-between gap-2 sm:col-span-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('eamusementSyncedAt')}</dt>
                    <dd className='font-medium'>
                        <BoardTimestamp value={eamusement.syncedAt} />
                    </dd>
                </div>
            </dl>
            {eamusement.notesRadar && (
                <div className='grid min-w-0 max-w-xl gap-1.5'>
                    <h4 className='text-xs font-medium'>{t('eamusementNotesRadar')}</h4>
                    <NotesRadarList notesRadar={eamusement.notesRadar} />
                </div>
            )}
        </section>
    )
}

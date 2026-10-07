'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useImportStatus } from '@entities/eamusement/eamusement.query'
import { EamusementImportStatus } from '@features/eamusement-import-status/eamusement-import-status'
import { EamusementPlayerInfo } from '@features/eamusement-player-info/eamusement-player-info'
import { NotesRadarList } from '@features/notes-radar-list/notes-radar-list'
import { Button } from '@shared/ui/button'
import { Skeleton } from '@shared/ui/skeleton'

export const EamusementImportLatest: FC = () => {
    const t = useTranslations('settings')
    const tCommon = useTranslations('common')
    const statusQuery = useImportStatus(true)
    const latest = statusQuery.data?.latest

    if (!statusQuery.data && statusQuery.isError) {
        return (
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <p role='alert' className='text-sm text-muted-foreground'>
                    {t('eamusementStatusLoadError')}
                </p>
                <Button variant='outline' size='sm' disabled={statusQuery.isFetching} onClick={() => void statusQuery.refetch()}>
                    {tCommon('retry')}
                </Button>
            </div>
        )
    }

    if (!statusQuery.data) {
        return (
            <div role='status' aria-label={t('eamusementStatusLoading')} aria-busy='true' className='grid max-w-xl min-w-0 gap-2'>
                <Skeleton className='h-4 w-40' />
                <Skeleton className='h-14 w-full' />
                <Skeleton className='h-4 w-full' />
            </div>
        )
    }

    if (!latest) return <p className='text-sm text-muted-foreground'>{t('eamusementStatusEmpty')}</p>

    return (
        <div className='grid max-w-xl min-w-0 gap-4'>
            <section className='grid min-w-0 gap-2'>
                <h3 className='text-xs font-medium'>{t('eamusementStatusTitle')}</h3>
                <EamusementImportStatus status={latest} />
            </section>
            <section className='grid min-w-0 gap-2'>
                <h3 className='text-xs font-medium'>{t('eamusementPlayerTitle')}</h3>
                <EamusementPlayerInfo player={latest.player} />
            </section>
            <section className='grid min-w-0 gap-2'>
                <h3 className='text-xs font-medium'>{t('eamusementRadarTitle')}</h3>
                {latest.notesRadar ? (
                    <NotesRadarList notesRadar={latest.notesRadar} />
                ) : (
                    <p className='text-xs text-muted-foreground'>{t('eamusementRadarEmpty')}</p>
                )}
            </section>
        </div>
    )
}

import { type FC, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import type { ImportResult } from '@entities/eamusement/eamusement.dto'
import { EamusementImportCounts } from '@features/eamusement-import-counts/eamusement-import-counts'
import { EamusementUnmatchedList } from '@features/eamusement-unmatched-list/eamusement-unmatched-list'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Skeleton } from '@shared/ui/skeleton'
import { EamusementHandoffChanges } from '@widgets/eamusement-handoff/eamusement-handoff-changes'

type EamusementHandoffResultProps = {
    result: ImportResult
}

export const EamusementHandoffResult: FC<EamusementHandoffResultProps> = ({ result }) => {
    const t = useTranslations('import')

    return (
        <div className='grid min-w-0 gap-4 p-3'>
            <section className='grid max-w-xl min-w-0 gap-2'>
                <h2 className='text-sm font-semibold'>{t('resultTitle')}</h2>
                <EamusementImportCounts receivedCount={result.receivedCount} matchedCount={result.matchedCount} changedCount={result.changedCount} />
            </section>
            <section className='grid min-w-0 gap-2'>
                <h2 className='text-sm font-semibold'>{t('changesTitle')}</h2>
                {result.changes.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>{t('changesEmpty')}</p>
                ) : (
                    <Suspense fallback={<Skeleton role='status' aria-label={t('changesLoading')} className='h-64 w-full' />}>
                        <EamusementHandoffChanges changes={result.changes} />
                    </Suspense>
                )}
                {result.changedCount > result.changes.length && (
                    <p className='text-xs text-muted-foreground'>
                        {t('changesLimitHint', { total: result.changedCount, limit: result.changes.length })}
                    </p>
                )}
            </section>
            <div className='grid max-w-xl min-w-0'>
                <EamusementUnmatchedList unmatched={result.unmatched} />
            </div>
            <div className='flex min-w-0'>
                <Button variant='outline' size='sm' asChild>
                    <Link href='/table'>{t('openTable')}</Link>
                </Button>
            </div>
        </div>
    )
}

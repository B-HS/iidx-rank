import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { CatalogSource } from '@entities/catalog/catalog.dto'
import { BoardTimestamp } from '@features/board-timestamp/board-timestamp'

type CatalogSourceSummaryProps = {
    source: Pick<CatalogSource, 'chartCount' | 'updatedAt' | 'fetchedAt'>
    versionCount: number
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const SOURCE_TIME_ZONE = 'Asia/Tokyo'

export const CatalogSourceSummary: FC<CatalogSourceSummaryProps> = ({ source, versionCount }) => {
    const t = useTranslations()
    const locale = useLocale()
    const updatedAt = source.updatedAt && DATE_ONLY_PATTERN.test(source.updatedAt) ? `${source.updatedAt}T00:00:00Z` : source.updatedAt
    const isUpdatedAtValid = updatedAt !== null && !Number.isNaN(Date.parse(updatedAt))

    return (
        <div className='flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3'>
            <dl className='grid min-w-0 gap-0.5'>
                <dt className='text-xs text-muted-foreground'>{t('checker.sourceCount')}</dt>
                <dd className='text-2xl leading-8 font-semibold tracking-tight tabular-nums'>{source.chartCount.toLocaleString(locale)}</dd>
            </dl>
            <dl className='grid min-w-0 gap-1 text-xs'>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('home.versionCount')}</dt>
                    <dd className='min-w-0 truncate font-medium tabular-nums'>{versionCount.toLocaleString(locale)}</dd>
                </div>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('checker.sourceUpdatedAt')}</dt>
                    <dd className='min-w-0 truncate font-medium tabular-nums'>
                        {isUpdatedAtValid
                            ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: SOURCE_TIME_ZONE }).format(new Date(updatedAt))
                            : t('checker.noTimestamp')}
                    </dd>
                </div>
                <div className='flex min-w-0 items-baseline justify-between gap-2'>
                    <dt className='shrink-0 text-muted-foreground'>{t('checker.sourceFetchedAt')}</dt>
                    <dd className='min-w-0 truncate font-medium tabular-nums'>
                        {source.fetchedAt ? <BoardTimestamp value={source.fetchedAt} /> : t('checker.noTimestamp')}
                    </dd>
                </div>
            </dl>
        </div>
    )
}

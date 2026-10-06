import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ProfileRecord } from '@entities/profile/profile.dto'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

type ProfileRecordListProps = {
    records: readonly ProfileRecord[]
}

export const ProfileRecordList: FC<ProfileRecordListProps> = ({ records }) => {
    const t = useTranslations()
    const locale = useLocale()
    const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'Asia/Tokyo' })

    if (records.length === 0) {
        return (
            <Empty className='min-h-48 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('profile.recordsEmptyTitle')}</EmptyTitle>
                    <EmptyDescription>{t('profile.recordsEmptyDescription')}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        )
    }

    return (
        <ul className='min-w-0 divide-y divide-border'>
            {records.map((record) => (
                <li key={record.chartId} className='flex min-w-0 items-center gap-3 px-3 py-2'>
                    <div className='grid min-w-0 flex-1 gap-0.5'>
                        <p className='truncate text-sm font-medium'>{record.title}</p>
                        <p className='truncate text-xs text-muted-foreground'>
                            {t(`difficulty.${record.difficulty}`)} · {record.version}
                        </p>
                    </div>
                    <div className='grid shrink-0 justify-items-end gap-0.5 text-xs'>
                        <span className='font-medium'>
                            {t(`lamp.${record.lamp}`)}
                            {record.scoreGrade && ` · ${record.scoreGrade}`}
                        </span>
                        <time dateTime={record.updatedAt} className='text-muted-foreground tabular-nums' title={t('profile.recordUpdatedAt')}>
                            {dateFormat.format(new Date(record.updatedAt))}
                        </time>
                    </div>
                </li>
            ))}
        </ul>
    )
}

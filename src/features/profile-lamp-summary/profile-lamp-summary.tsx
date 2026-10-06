import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ProfileRecord } from '@entities/profile/profile.dto'
import { Progress } from '@shared/ui/progress'

type ProfileLampSummaryProps = {
    items: readonly { lamp: ProfileRecord['lamp']; count: number }[]
    total: number
}

const PERCENT_SCALE = 100

export const ProfileLampSummary: FC<ProfileLampSummaryProps> = ({ items, total }) => {
    const t = useTranslations()
    const locale = useLocale()

    return (
        <section className='grid min-w-0 gap-3 p-3'>
            <h3 className='checker-micro-label'>{t('profile.lampSummaryTitle')}</h3>
            {total === 0 ? (
                <p className='text-xs text-muted-foreground'>{t('profile.lampSummaryEmpty')}</p>
            ) : (
                <ul className='grid min-w-0 max-w-xl gap-2'>
                    {items.map(({ lamp, count }) => (
                        <li key={lamp} className='grid min-w-0 gap-1'>
                            <div className='flex min-w-0 items-center justify-between gap-2 text-xs'>
                                <span className='min-w-0 truncate'>{t(`lamp.${lamp}`)}</span>
                                <span className='shrink-0 font-medium tabular-nums'>{count.toLocaleString(locale)}</span>
                            </div>
                            <Progress value={Math.round((count / total) * PERCENT_SCALE)} aria-label={t(`lamp.${lamp}`)} />
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

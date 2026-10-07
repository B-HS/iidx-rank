'use client'
import type { FC } from 'react'
import { LogIn } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { DashboardPanel } from '@features/dashboard-panel/dashboard-panel'
import { DashboardPanelLink } from '@features/dashboard-panel/dashboard-panel-link'
import { Button } from '@shared/ui/button'

const FEATURE_KEYS = ['guestFeatureTable', 'guestFeatureRecords', 'guestFeatureImport'] as const

export const HomeGuestIntroPanel: FC = () => {
    const t = useTranslations()

    return (
        <DashboardPanel title={t('home.guestIntroTitle')} bodyClassName='justify-between gap-3'>
            <div className='grid min-w-0 gap-2'>
                <p className='text-xs text-pretty'>{t('home.guestIntroDescription')}</p>
                <ul className='grid min-w-0 gap-1 text-xs text-muted-foreground'>
                    {FEATURE_KEYS.map((key) => (
                        <li key={key} className='flex min-w-0 gap-1.5'>
                            <span aria-hidden='true' className='mt-1.5 size-1 shrink-0 bg-muted-foreground' />
                            <span className='min-w-0'>{t(`home.${key}`)}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex min-w-0 shrink-0 flex-wrap items-center gap-2'>
                <AuthDialogWidget>
                    <Button size='sm'>
                        <LogIn aria-hidden='true' />
                        {t('home.guestSignIn')}
                    </Button>
                </AuthDialogWidget>
                <DashboardPanelLink href='/table' variant='outline' size='sm'>
                    {t('home.openTable')}
                </DashboardPanelLink>
            </div>
        </DashboardPanel>
    )
}

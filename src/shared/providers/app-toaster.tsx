'use client'

import type { FC } from 'react'
import { useTheme } from 'next-themes'
import { Toaster } from 'sonner'
import { useTranslations } from 'next-intl'

export const AppToaster: FC = () => {
    const t = useTranslations()
    const { resolvedTheme } = useTheme()

    return <Toaster position='bottom-right' theme={resolvedTheme === 'dark' ? 'dark' : 'light'} containerAriaLabel={t('common.notifications')} />
}

import type { FC, PropsWithChildren } from 'react'
import { useTranslations } from 'next-intl'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'

export const ProfileSettingsFrame: FC<PropsWithChildren> = ({ children }) => {
    const t = useTranslations('settings')

    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('title')} description={t('description')} />
            <div className='flex min-w-0 flex-1 flex-col md:min-h-0 md:overflow-auto'>{children}</div>
        </section>
    )
}

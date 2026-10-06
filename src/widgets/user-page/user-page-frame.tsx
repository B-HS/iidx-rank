import type { FC, PropsWithChildren } from 'react'
import { useTranslations } from 'next-intl'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'

export const UserPageFrame: FC<PropsWithChildren> = ({ children }) => {
    const t = useTranslations('profile')

    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('pageTitle')} />
            <div className='flex min-w-0 flex-1 flex-col md:min-h-0 md:overflow-auto'>{children}</div>
        </section>
    )
}

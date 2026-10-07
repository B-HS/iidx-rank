import type { FC, PropsWithChildren } from 'react'
import { useTranslations } from 'next-intl'
import { ScrollContainer } from '@shared/ui/scroll-container'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'

export const HomeDashboardFrame: FC<PropsWithChildren> = ({ children }) => {
    const t = useTranslations('navigation')

    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('home')} />
            <ScrollContainer className='@container/dashboard flex flex-col'>{children}</ScrollContainer>
        </section>
    )
}

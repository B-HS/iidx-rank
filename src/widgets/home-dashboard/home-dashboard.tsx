import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'
export const HomeDashboard: FC = () => {
    const t = useTranslations()
    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('navigation.home')} />
            <div className='flex min-w-0 flex-1 md:min-h-0 md:overflow-auto'>
                <Empty className='min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('home.emptyTitle')}</EmptyTitle>
                        <EmptyDescription>{t('home.emptyDescription')}</EmptyDescription>
                    </EmptyHeader>
                    <Button variant='outline' size='sm' asChild>
                        <Link href='/table'>{t('navigation.checker')}</Link>
                    </Button>
                </Empty>
            </div>
        </section>
    )
}

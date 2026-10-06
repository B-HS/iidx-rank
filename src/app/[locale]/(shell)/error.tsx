'use client'
import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { ScrollContainer } from '@shared/ui/scroll-container'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'
type Props = {
    error: Error
    retry: () => void
}
const ShellErrorPage: FC<Props> = ({ retry }) => {
    const t = useTranslations()
    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('errors.pageTitle')} />
            <ScrollContainer className='flex'>
                <Empty className='min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('errors.genericTitle')}</EmptyTitle>
                        <EmptyDescription>{t('errors.genericDescription')}</EmptyDescription>
                    </EmptyHeader>
                    <Button variant='outline' size='sm' onClick={() => retry()}>
                        {t('common.retry')}
                    </Button>
                </Empty>
            </ScrollContainer>
        </section>
    )
}
export default ShellErrorPage

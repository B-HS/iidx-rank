'use client'
import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
type Props = {
    error: Error
    retry: () => void
}
const ErrorPage: FC<Props> = ({ retry }) => {
    const t = useTranslations()
    return (
        <main className='flex min-h-dvh items-center justify-center p-3 sm:p-4'>
            <Empty className='min-h-64 max-w-xl border-0'>
                <EmptyHeader>
                    <EmptyTitle>
                        <h1>{t('errors.genericTitle')}</h1>
                    </EmptyTitle>
                    <EmptyDescription>{t('errors.genericDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' size='sm' onClick={() => retry()}>
                    {t('common.retry')}
                </Button>
            </Empty>
        </main>
    )
}
export default ErrorPage

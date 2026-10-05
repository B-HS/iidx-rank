import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
const NotFoundPage: FC = () => {
    const t = useTranslations()
    return (
        <main className='flex min-h-dvh items-center justify-center p-3 sm:p-4'>
            <Empty className='min-h-64 max-w-xl border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('errors.notFoundTitle')}</EmptyTitle>
                    <EmptyDescription>{t('errors.notFoundDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' asChild>
                    <Link href='/'>{t('navigation.checker')}</Link>
                </Button>
            </Empty>
        </main>
    )
}
export default NotFoundPage

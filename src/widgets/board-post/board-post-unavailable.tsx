import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

export const BoardPostUnavailable: FC = () => {
    const t = useTranslations('board')

    return (
        <Empty className='min-h-64 border-0'>
            <EmptyHeader>
                <EmptyTitle>{t('postUnavailableTitle')}</EmptyTitle>
                <EmptyDescription>{t('postUnavailableDescription')}</EmptyDescription>
            </EmptyHeader>
            <Button variant='outline' size='sm' asChild>
                <Link href='/board'>{t('backToList')}</Link>
            </Button>
        </Empty>
    )
}

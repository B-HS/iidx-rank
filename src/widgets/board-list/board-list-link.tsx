import type { FC } from 'react'
import { List } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'

export const BoardListLink: FC = () => {
    const t = useTranslations('board')

    return (
        <Button variant='outline' size='sm' asChild>
            <Link href='/board'>
                <List aria-hidden='true' />
                {t('backToList')}
            </Link>
        </Button>
    )
}

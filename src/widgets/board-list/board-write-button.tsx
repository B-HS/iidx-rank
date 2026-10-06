'use client'
import type { FC } from 'react'
import { PenLine } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'

type BoardWriteButtonProps = {
    isSignedIn: boolean
}

export const BoardWriteButton: FC<BoardWriteButtonProps> = ({ isSignedIn }) => {
    const t = useTranslations('board')

    if (!isSignedIn) {
        return (
            <AuthDialogWidget>
                <Button variant='outline' size='sm'>
                    <PenLine aria-hidden='true' />
                    {t('write')}
                </Button>
            </AuthDialogWidget>
        )
    }

    return (
        <Button variant='outline' size='sm' asChild>
            <Link href='/board/new'>
                <PenLine aria-hidden='true' />
                {t('write')}
            </Link>
        </Button>
    )
}

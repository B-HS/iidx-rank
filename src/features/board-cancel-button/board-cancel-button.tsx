'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@shared/i18n/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@shared/ui/alert-dialog'
import { Button } from '@shared/ui/button'

type BoardCancelButtonProps = {
    href: string
    hasUnsavedChanges: boolean
}

export const BoardCancelButton: FC<BoardCancelButtonProps> = ({ href, hasUnsavedChanges }) => {
    const t = useTranslations()
    const router = useRouter()

    if (!hasUnsavedChanges) {
        return (
            <Button variant='ghost' size='sm' asChild>
                <Link href={href}>{t('common.cancel')}</Link>
            </Button>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button type='button' variant='ghost' size='sm'>
                    {t('common.cancel')}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('board.discardConfirmTitle')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('board.discardConfirmDescription')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('board.discardCancel')}</AlertDialogCancel>
                    <AlertDialogAction variant='destructive' onClick={() => router.push(href)}>
                        {t('board.discardConfirm')}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

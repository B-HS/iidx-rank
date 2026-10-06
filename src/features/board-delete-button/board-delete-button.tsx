'use client'
import type { FC } from 'react'
import { Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
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

type BoardDeleteButtonProps = {
    label: string
    confirmTitle: string
    confirmDescription: string
    isPending: boolean
    onConfirm: () => void
    isLabelVisible?: boolean
    className?: string
}

export const BoardDeleteButton: FC<BoardDeleteButtonProps> = ({
    label,
    confirmTitle,
    confirmDescription,
    isPending,
    onConfirm,
    isLabelVisible = false,
    className,
}) => {
    const t = useTranslations('common')

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    type='button'
                    variant={isLabelVisible ? 'outline' : 'ghost'}
                    size={isLabelVisible ? 'sm' : 'icon-sm'}
                    aria-label={isLabelVisible ? undefined : label}
                    disabled={isPending}
                    className={className}>
                    <Trash2 aria-hidden='true' />
                    {isLabelVisible && label}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction variant='destructive' onClick={onConfirm}>
                        {label}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

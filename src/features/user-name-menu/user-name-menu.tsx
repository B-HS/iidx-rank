'use client'
import { type FC, useState } from 'react'
import { Ban, CircleUserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Author } from '@entities/board/board.dto'
import { Link } from '@shared/i18n/navigation'
import { cn } from '@shared/lib/utils'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@shared/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@shared/ui/dropdown-menu'

type UserNameMenuProps = {
    author: Author
    canBlock: boolean
    onBlock: () => void
    isBlocking?: boolean
    className?: string
}

const NAME_CLASS_NAME = 'min-w-0 truncate text-left'

export const UserNameMenu: FC<UserNameMenuProps> = ({ author, canBlock, onBlock, isBlocking = false, className }) => {
    const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false)
    const t = useTranslations()

    if (!author.isPublic && !canBlock) return <span className={cn(NAME_CLASS_NAME, className)}>{author.name}</span>

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type='button'
                        className={cn(
                            NAME_CLASS_NAME,
                            'outline-none hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline aria-expanded:text-foreground',
                            className,
                        )}>
                        {author.name}
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-44'>
                    {author.isPublic && (
                        <DropdownMenuItem asChild>
                            <Link href={`/u/${author.handle}`}>
                                <CircleUserRound aria-hidden='true' />
                                {t('board.viewProfile')}
                            </Link>
                        </DropdownMenuItem>
                    )}
                    {canBlock && (
                        <DropdownMenuItem variant='destructive' disabled={isBlocking} onSelect={() => setIsBlockConfirmOpen(true)}>
                            <Ban aria-hidden='true' />
                            {t('board.block')}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={isBlockConfirmOpen} onOpenChange={setIsBlockConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('board.blockConfirmTitle', { name: author.name })}</AlertDialogTitle>
                        <AlertDialogDescription>{t('board.blockConfirmDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction variant='destructive' onClick={onBlock}>
                            {t('board.block')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}

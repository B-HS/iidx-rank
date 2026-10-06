import type { FC, PropsWithChildren } from 'react'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'

type BoardPaginationControlProps = PropsWithChildren<{
    target: { href: string } | { onSelect: () => void }
    label: string
    isActive?: boolean
    isDisabled?: boolean
}>

export const BoardPaginationControl: FC<BoardPaginationControlProps> = ({ target, label, isActive = false, isDisabled = false, children }) => {
    const variant = isActive ? 'outline' : 'ghost'
    const currentPage = isActive ? 'page' : undefined

    if (isDisabled || !('href' in target)) {
        return (
            <Button
                type='button'
                variant={variant}
                size='icon'
                aria-label={label}
                aria-current={currentPage}
                disabled={isDisabled}
                onClick={'onSelect' in target ? target.onSelect : undefined}>
                {children}
            </Button>
        )
    }

    return (
        <Button variant={variant} size='icon' asChild>
            <Link href={target.href} aria-label={label} aria-current={currentPage}>
                {children}
            </Link>
        </Button>
    )
}

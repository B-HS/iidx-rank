import { House, type LucideIcon, MessagesSquare, Music2, Users } from 'lucide-react'
import type { Messages } from 'next-intl'

export type ShellNavItem = {
    href: string
    labelKey: keyof Messages['navigation']
    icon: LucideIcon
}

export const SHELL_NAV_ITEMS: readonly ShellNavItem[] = [
    { href: '/', labelKey: 'home', icon: House },
    { href: '/users', labelKey: 'users', icon: Users },
    { href: '/board', labelKey: 'board', icon: MessagesSquare },
    { href: '/table', labelKey: 'checker', icon: Music2 },
]

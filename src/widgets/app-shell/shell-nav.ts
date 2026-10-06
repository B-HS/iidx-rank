import { House, type LucideIcon, Music2 } from 'lucide-react'
import type { Messages } from 'next-intl'

export type ShellNavItem = {
    href: string
    labelKey: keyof Messages['navigation']
    icon: LucideIcon
}

export const SHELL_PRIMARY_NAV_ITEMS: readonly ShellNavItem[] = [
    { href: '/', labelKey: 'home', icon: House },
    { href: '/table', labelKey: 'checker', icon: Music2 },
]
export const SHELL_SECONDARY_NAV_ITEMS: readonly ShellNavItem[] = []

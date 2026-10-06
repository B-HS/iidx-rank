'use client'
import { type FC, Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@shared/i18n/navigation'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@shared/ui/sidebar'
import type { ShellNavItem } from '@widgets/app-shell/shell-nav'
type Props = { items: readonly ShellNavItem[] }
const NAV_MENU_BUTTON_CLASS_NAME =
    'h-9 rounded-none px-3 group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!'
const ShellNavMenuItems: FC<Props & { pathname: string | null }> = ({ items, pathname }) => {
    const t = useTranslations('navigation')
    return (
        <SidebarMenu className='gap-0 p-0'>
            {items.map(({ href, labelKey, icon: Icon }) => {
                const isActive = pathname !== null && (href === '/' ? pathname === href : pathname === href || pathname.startsWith(href + '/'))
                return (
                    <SidebarMenuItem key={href} className='min-w-0 flex-1'>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={t(labelKey)} className={NAV_MENU_BUTTON_CLASS_NAME}>
                            <Link href={href} aria-label={t(labelKey)} aria-current={isActive ? 'page' : undefined}>
                                <Icon />
                                <span className='group-data-[collapsible=icon]:hidden'>{t(labelKey)}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                )
            })}
        </SidebarMenu>
    )
}
const ActiveShellNavMenuItems: FC<Props> = ({ items }) => {
    const pathname = usePathname()
    return <ShellNavMenuItems items={items} pathname={pathname} />
}
export const ShellNavMenu: FC<Props> = ({ items }) => {
    if (items.length === 0) return null
    return (
        <Suspense fallback={<ShellNavMenuItems items={items} pathname={null} />}>
            <ActiveShellNavMenuItems items={items} />
        </Suspense>
    )
}

'use client'
import { type CSSProperties, type FC, type PropsWithChildren, type TransitionStartFunction, useState, useTransition } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { CircleUserRound, Languages, LogIn, LogOut, Moon, Sun, UserRound, UserRoundPen } from 'lucide-react'
import { hasLocale, useLocale, useTranslations } from 'next-intl'
import { Link, usePathname, useRouter } from '@shared/i18n/navigation'
import { routing } from '@shared/i18n/routing'
import { authClient } from '@entities/auth/auth.api'
import { useMyProfile } from '@entities/profile/profile.query'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { LOCALE_OPTIONS } from '@shared/constants/locale'
import {
    SHELL_RAIL_CHROME_HEIGHT_PX,
    SHELL_SIDEBAR_COLLAPSED_WIDTH_PX,
    SHELL_SIDEBAR_MOBILE_WIDTH_PX,
    SHELL_SIDEBAR_WIDTH_PX,
} from '@shared/constants/ui'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'
import { ShellSidebarSlotContext } from '@shared/providers/shell-sidebar-slot-context'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@shared/ui/dropdown-menu'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@shared/ui/sidebar'
import { Skeleton } from '@shared/ui/skeleton'
import { TooltipProvider } from '@shared/ui/tooltip'
import { SHELL_PRIMARY_NAV_ITEMS, SHELL_SECONDARY_NAV_ITEMS } from '@widgets/app-shell/shell-nav'
import { ShellNavMenu } from '@widgets/app-shell/shell-nav-menu'
import { RecentUsers } from '@widgets/recent-users/recent-users'
type LanguageMenuProps = {
    isPending: boolean
    startTransition: TransitionStartFunction
}
const FOOTER_MENU_ITEM_CLASS_NAME = 'flex h-full min-w-0 items-center'
const FOOTER_MENU_BUTTON_CLASS_NAME =
    'h-full justify-center rounded-none px-3 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-0!'
const ThemeControl: FC = () => {
    const t = useTranslations()
    const { resolvedTheme, setTheme } = useTheme()
    return (
        <SidebarMenuItem className={FOOTER_MENU_ITEM_CLASS_NAME}>
            <SidebarMenuButton
                className={FOOTER_MENU_BUTTON_CLASS_NAME}
                aria-label={t('navigation.theme')}
                tooltip={t('navigation.theme')}
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
                <Sun className='hidden dark:block' />
                <Moon className='dark:hidden' />
                <span className='min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden'>{t('navigation.theme')}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
const LanguageMenu: FC<LanguageMenuProps> = ({ isPending, startTransition }) => {
    const t = useTranslations()
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()
    const handleLocaleChange = (value: string) => {
        if (value === locale || !hasLocale(routing.locales, value)) return
        const searchParams = new URLSearchParams(window.location.search)
        const query = Object.fromEntries([...new Set(searchParams.keys())].map((key) => [key, searchParams.getAll(key)] as const))
        startTransition(() => router.replace(searchParams.size > 0 ? { pathname, query } : pathname, { locale: value }))
    }
    return (
        <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isPending}>
                <Languages />
                {t('navigation.language')}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
                <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
                        {LOCALE_OPTIONS.map((option) => (
                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                                {option.label}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
            </DropdownMenuPortal>
        </DropdownMenuSub>
    )
}
const AccountControl: FC = () => {
    const t = useTranslations()
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [isLocalePending, startLocaleTransition] = useTransition()
    const identityTransition = useIdentityTransition()
    const { data: session, isPending } = authClient.useSession()
    const myProfileQuery = useMyProfile(Boolean(session?.user))
    const myHandle = session?.user && myProfileQuery.data?.userId === session.user.id ? myProfileQuery.data.handle : null
    const handleSignOut = async () => {
        try {
            const result = await authClient.signOut()
            if (result.error) {
                toast.error(t('auth.signOutError'))
                return
            }
            identityTransition.begin(session?.user.id ?? null)
            toast.success(t('navigation.signedOut'))
        } catch {
            toast.error(t('auth.signOutError'))
        }
    }
    const displayName = session?.user.name ?? session?.user.email ?? t('navigation.accountMenu')
    return (
        <SidebarMenuItem className={FOOTER_MENU_ITEM_CLASS_NAME}>
            {isPending || identityTransition.isPending ? (
                <div
                    role='status'
                    aria-label={t('auth.loadingSession')}
                    aria-busy='true'
                    className='flex h-full w-full items-center justify-center gap-2 px-3 group-data-[collapsible=icon]:px-1'>
                    <Skeleton className='size-4' />
                    <Skeleton className='h-3 min-w-0 flex-1 group-data-[collapsible=icon]:hidden' />
                </div>
            ) : (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            className={FOOTER_MENU_BUTTON_CLASS_NAME}
                            aria-label={t('navigation.accountMenu')}
                            tooltip={t('navigation.accountMenu')}>
                            <UserRound />
                            <span className='min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden'>{displayName}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' side='top' className='w-60'>
                        <DropdownMenuLabel className='grid gap-0.5'>
                            <span className='truncate'>{displayName}</span>
                            <span className='truncate text-xs font-normal text-muted-foreground'>{session?.user.email ?? t('navigation.guest')}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {session?.user && myHandle && (
                            <DropdownMenuItem asChild>
                                <Link href={`/u/${myHandle}`}>
                                    <CircleUserRound />
                                    {t('navigation.myPage')}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        {session?.user && !myHandle && (
                            <DropdownMenuItem disabled>
                                <CircleUserRound />
                                {t('navigation.myPage')}
                            </DropdownMenuItem>
                        )}
                        {session?.user && (
                            <DropdownMenuItem asChild>
                                <Link href='/settings'>
                                    <UserRoundPen />
                                    {t('navigation.profileSettings')}
                                </Link>
                            </DropdownMenuItem>
                        )}
                        <LanguageMenu isPending={isLocalePending} startTransition={startLocaleTransition} />
                        {session?.user ? (
                            <DropdownMenuItem onSelect={() => void handleSignOut()}>
                                <LogOut />
                                {t('navigation.signOut')}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onSelect={() => setIsAuthDialogOpen(true)}>
                                <LogIn />
                                {t('navigation.signIn')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            <AuthDialogWidget open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
        </SidebarMenuItem>
    )
}
export const AppShell: FC<PropsWithChildren> = ({ children }) => {
    const [sidebarSlotElement, setSidebarSlotElement] = useState<HTMLElement | null>(null)
    const t = useTranslations()
    return (
        <TooltipProvider>
            <SidebarProvider
                className='min-h-dvh w-full md:h-full md:min-h-0 md:overflow-hidden'
                style={
                    {
                        '--sidebar-width': SHELL_SIDEBAR_WIDTH_PX + 'px',
                        '--sidebar-width-icon': SHELL_SIDEBAR_COLLAPSED_WIDTH_PX + 'px',
                        '--sidebar-width-mobile': SHELL_SIDEBAR_MOBILE_WIDTH_PX + 'px',
                    } as CSSProperties
                }>
                <ShellSidebarSlotContext.Provider value={{ element: sidebarSlotElement }}>
                    <div className='flex min-h-dvh w-full md:h-full md:min-h-0 md:overflow-hidden'>
                        <Sidebar collapsible='icon' className='border-r-0 group-data-[side=left]:border-r-0'>
                            <SidebarHeader className='flex shrink-0 flex-row items-center gap-2 p-0' style={{ height: SHELL_RAIL_CHROME_HEIGHT_PX }}>
                                <SidebarTrigger aria-label={t('navigation.toggleSidebar')} className='ml-2 size-8 shrink-0' />
                                <Link
                                    href='/'
                                    aria-label={t('app.name')}
                                    className='flex min-w-0 items-center gap-2 text-foreground group-data-[collapsible=icon]:hidden'>
                                    <span className='truncate text-sm font-semibold tracking-tight'>{t('app.name')}</span>
                                </Link>
                            </SidebarHeader>
                            <SidebarContent className='min-h-0 p-0'>
                                <ShellNavMenu items={SHELL_PRIMARY_NAV_ITEMS} />
                                <div ref={setSidebarSlotElement} className='min-w-0 group-data-[collapsible=icon]:hidden' />
                                <div className='min-w-0 group-data-[collapsible=icon]:hidden'>
                                    <RecentUsers />
                                </div>
                                <ShellNavMenu items={SHELL_SECONDARY_NAV_ITEMS} />
                            </SidebarContent>
                            <SidebarFooter className='h-12 shrink-0 gap-0 bg-sidebar p-0 group-data-[collapsible=icon]:h-24'>
                                <SidebarMenu className='grid h-full grid-cols-2 items-stretch gap-0 group-data-[collapsible=icon]:grid-cols-1'>
                                    <ThemeControl />
                                    <AccountControl />
                                </SidebarMenu>
                            </SidebarFooter>
                        </Sidebar>
                        <SidebarInset className='min-h-dvh min-w-0 rounded-none shadow-none md:h-full md:min-h-0 md:overflow-hidden'>
                            <div className='flex min-h-dvh min-w-0 flex-1 flex-col bg-background md:h-full md:min-h-0 md:overflow-hidden'>
                                {children}
                            </div>
                        </SidebarInset>
                    </div>
                </ShellSidebarSlotContext.Provider>
            </SidebarProvider>
        </TooltipProvider>
    )
}

'use client'
import { type CSSProperties, type FC, type PropsWithChildren, type ReactNode, useState } from 'react'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { LogIn, LogOut, Moon, Music2, Settings, Sun, UserRound } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@shared/i18n/navigation'
import { authClient } from '@entities/auth/auth.api'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import {
    SHELL_RAIL_CHROME_HEIGHT_PX,
    SHELL_SIDEBAR_COLLAPSED_WIDTH_PX,
    SHELL_SIDEBAR_MOBILE_WIDTH_PX,
    SHELL_SIDEBAR_WIDTH_PX,
} from '@shared/constants/ui'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
type Props = PropsWithChildren<{
    sidebarContent?: ReactNode
    onOpenSettings?: () => void
}>
const FOOTER_MENU_ITEM_CLASS_NAME = 'flex h-full min-w-0 items-center'
const FOOTER_MENU_BUTTON_CLASS_NAME =
    'h-full justify-center rounded-none px-3 group-data-[collapsible=icon]:h-12! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:p-0!'
const ThemeControl: FC = () => {
    const t = useTranslations()
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    return (
        <SidebarMenuItem className={FOOTER_MENU_ITEM_CLASS_NAME}>
            <SidebarMenuButton
                className={FOOTER_MENU_BUTTON_CLASS_NAME}
                aria-label={t('navigation.theme')}
                tooltip={t('navigation.theme')}
                onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                {isDark ? <Sun /> : <Moon />}
                <span className='min-w-0 flex-1 truncate text-left group-data-[collapsible=icon]:hidden'>{t('navigation.theme')}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}
const AccountControl: FC<Pick<Props, 'onOpenSettings'>> = ({ onOpenSettings }) => {
    const t = useTranslations()
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const identityTransition = useIdentityTransition()
    const { data: session, isPending } = authClient.useSession()
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
    if (isPending || identityTransition.isPending) {
        return (
            <SidebarMenuItem className={FOOTER_MENU_ITEM_CLASS_NAME}>
                <div
                    role='status'
                    aria-label={t('auth.loadingSession')}
                    aria-busy='true'
                    className='flex h-full w-full items-center justify-center gap-2 px-3 group-data-[collapsible=icon]:px-1'>
                    <Skeleton className='size-4' />
                    <Skeleton className='h-3 min-w-0 flex-1 group-data-[collapsible=icon]:hidden' />
                </div>
            </SidebarMenuItem>
        )
    }
    const displayName = session?.user.name ?? session?.user.email ?? t('navigation.accountMenu')
    return (
        <SidebarMenuItem className={FOOTER_MENU_ITEM_CLASS_NAME}>
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
                    <DropdownMenuItem disabled={!onOpenSettings} onSelect={onOpenSettings}>
                        <Settings />
                        {t('navigation.settings')}
                    </DropdownMenuItem>
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
            <AuthDialogWidget open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
        </SidebarMenuItem>
    )
}
export const AppShell: FC<Props> = ({ children, sidebarContent, onOpenSettings }) => {
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
                <div className='flex min-h-dvh w-full md:h-full md:min-h-0 md:overflow-hidden'>
                    <Sidebar collapsible='icon' className='border-r-0 group-data-[side=left]:border-r-0'>
                        <SidebarHeader className='flex shrink-0 flex-row items-center gap-2 p-0' style={{ height: SHELL_RAIL_CHROME_HEIGHT_PX }}>
                            <SidebarTrigger aria-label={t('navigation.toggleSidebar')} className='ml-2 size-8 shrink-0' />
                            <Link href='/' aria-label={t('app.name')} className='flex min-w-0 items-center gap-2 text-foreground'>
                                <span className='truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden'>
                                    {t('app.name')}
                                </span>
                            </Link>
                        </SidebarHeader>
                        <SidebarContent className='min-h-0 p-0'>
                            <SidebarMenu className='gap-0 p-0'>
                                <SidebarMenuItem className='min-w-0 flex-1'>
                                    <SidebarMenuButton
                                        asChild
                                        isActive
                                        tooltip={t('navigation.checker')}
                                        className='h-9 rounded-none px-3 group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:w-full! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0!'>
                                        <Link href='/' aria-label={t('navigation.checker')}>
                                            <Music2 />
                                            <span className='group-data-[collapsible=icon]:hidden'>{t('navigation.checker')}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                            <div className='min-w-0 group-data-[collapsible=icon]:hidden'>{sidebarContent}</div>
                        </SidebarContent>
                        <SidebarFooter className='h-12 shrink-0 gap-0 bg-sidebar p-0 group-data-[collapsible=icon]:h-24'>
                            <SidebarMenu className='grid h-full grid-cols-2 items-stretch gap-0 group-data-[collapsible=icon]:grid-cols-1'>
                                <ThemeControl />
                                <AccountControl onOpenSettings={onOpenSettings} />
                            </SidebarMenu>
                        </SidebarFooter>
                    </Sidebar>
                    <SidebarInset className='min-h-dvh min-w-0 rounded-none shadow-none md:h-full md:min-h-0 md:overflow-hidden'>
                        <main className='flex min-h-dvh min-w-0 flex-1 flex-col bg-background md:h-full md:min-h-0 md:overflow-hidden'>
                            {children}
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    )
}

'use client'

import { type CSSProperties, type FC, type PropsWithChildren, type ReactNode } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { LogIn, LogOut, Moon, Music2, Sun, UserRound } from 'lucide-react'

import { authClient } from '@entities/auth/auth.api'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import {
    SHELL_RAIL_CHROME_HEIGHT_PX,
    SHELL_SIDEBAR_COLLAPSED_WIDTH_PX,
    SHELL_SIDEBAR_MOBILE_WIDTH_PX,
    SHELL_SIDEBAR_WIDTH_PX,
} from '@shared/constants/ui'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'
import { MESSAGES } from '@shared/messages/messages'
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
}>

const ThemeControl: FC = () => {
    const { resolvedTheme, setTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'

    return (
        <SidebarMenuItem className='min-w-0 flex-1'>
            <SidebarMenuButton
                className='group-data-[collapsible=icon]:size-6! group-data-[collapsible=icon]:p-1!'
                tooltip={MESSAGES.navigation.theme}
                onClick={() => setTheme(isDark ? 'light' : 'dark')}>
                {isDark ? <Sun /> : <Moon />}
                <span>{MESSAGES.navigation.theme}</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
}

const AccountControl: FC = () => {
    const identityTransition = useIdentityTransition()
    const { data: session, isPending } = authClient.useSession()
    const handleSignOut = async () => {
        try {
            const result = await authClient.signOut()

            if (result.error) {
                toast.error(MESSAGES.auth.signOutError)
                return
            }

            identityTransition.begin(session?.user.id ?? null)
            toast.success(MESSAGES.navigation.signedOut)
        } catch {
            toast.error(MESSAGES.auth.signOutError)
        }
    }

    if (isPending) {
        return (
            <SidebarMenuItem className='min-w-0 flex-1'>
                <div className='flex h-9 items-center gap-2 px-2'>
                    <Skeleton className='size-4' />
                    <Skeleton className='h-3 w-20' />
                </div>
            </SidebarMenuItem>
        )
    }

    if (session?.user) {
        const displayName = session.user.name ?? session.user.email

        return (
            <SidebarMenuItem className='min-w-0 flex-1'>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            className='group-data-[collapsible=icon]:size-6! group-data-[collapsible=icon]:p-1!'
                            tooltip={MESSAGES.navigation.accountMenu}>
                            <UserRound />
                            <span className='min-w-0 flex-1 truncate'>{displayName}</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' side='top' className='w-60'>
                        <DropdownMenuLabel className='grid gap-0.5'>
                            <span className='truncate'>{displayName}</span>
                            <span className='truncate text-xs font-normal text-muted-foreground'>{session.user.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => void handleSignOut()}>
                            <LogOut />
                            {MESSAGES.navigation.signOut}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        )
    }

    return (
        <SidebarMenuItem className='min-w-0 flex-1'>
            <AuthDialogWidget>
                <SidebarMenuButton
                    className='group-data-[collapsible=icon]:size-6! group-data-[collapsible=icon]:p-1!'
                    tooltip={MESSAGES.navigation.signIn}>
                    <LogIn />
                    <span>{MESSAGES.navigation.signIn}</span>
                </SidebarMenuButton>
            </AuthDialogWidget>
        </SidebarMenuItem>
    )
}

export const AppShell: FC<Props> = ({ children, sidebarContent }) => (
    <TooltipProvider>
        <SidebarProvider
            className='h-full min-h-0 w-full overflow-hidden'
            style={
                {
                    '--sidebar-width': SHELL_SIDEBAR_WIDTH_PX + 'px',
                    '--sidebar-width-icon': SHELL_SIDEBAR_COLLAPSED_WIDTH_PX + 'px',
                    '--sidebar-width-mobile': SHELL_SIDEBAR_MOBILE_WIDTH_PX + 'px',
                } as CSSProperties
            }>
            <div className='flex h-full min-h-0 w-full overflow-hidden'>
                <Sidebar collapsible='icon' className='border-r-0 group-data-[side=left]:border-r-0'>
                    <SidebarHeader className='flex shrink-0 flex-row items-center gap-2 p-0' style={{ height: SHELL_RAIL_CHROME_HEIGHT_PX }}>
                        <SidebarTrigger aria-label={MESSAGES.navigation.toggleSidebar} className='ml-2 size-8 shrink-0' />
                        <Link href='/' aria-label={MESSAGES.app.name} className='flex min-w-0 items-center gap-2 text-foreground'>
                            <span className='truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden'>
                                {MESSAGES.app.name}
                            </span>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent className='min-h-0 p-0'>
                        <SidebarMenu className='gap-0 p-0'>
                            <SidebarMenuItem className='min-w-0 flex-1'>
                                <SidebarMenuButton asChild isActive tooltip={MESSAGES.navigation.checker} className='h-9 rounded-none px-3'>
                                    <Link href='/'>
                                        <Music2 />
                                        <span>{MESSAGES.navigation.checker}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                        <div className='min-w-0 group-data-[collapsible=icon]:hidden'>{sidebarContent}</div>
                    </SidebarContent>
                    <SidebarFooter className='gap-0 bg-sidebar p-0' style={{ height: SHELL_RAIL_CHROME_HEIGHT_PX }}>
                        <SidebarMenu className='h-full flex-row items-center gap-0'>
                            <ThemeControl />
                            <AccountControl />
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
                <SidebarInset className='h-full min-h-0 min-w-0 overflow-hidden rounded-none shadow-none'>
                    <main className='flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background'>{children}</main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    </TooltipProvider>
)

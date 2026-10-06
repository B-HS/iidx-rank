'use client'

import { type FC, type PropsWithChildren, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'

import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { THEME_STORAGE_KEY } from '@shared/constants/ui'
import { AppToaster } from '@shared/providers/app-toaster'
import { IdentityTransitionProvider } from '@shared/providers/identity-transition-provider'

const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: DEFAULT_QUERY_STALE_TIME_MS,
            },
        },
    })

export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
    const [queryClient] = useState(createQueryClient)

    return (
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false} storageKey={THEME_STORAGE_KEY} disableTransitionOnChange>
            <QueryClientProvider client={queryClient}>
                <IdentityTransitionProvider>
                    {children}
                    <AppToaster />
                </IdentityTransitionProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

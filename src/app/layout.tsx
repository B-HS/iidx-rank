import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import type { FC, PropsWithChildren } from 'react'

import { MESSAGES } from '@shared/messages/messages'
import { AppProviders } from '@shared/providers/app-providers'

import './globals.css'

export const metadata: Metadata = {
    title: MESSAGES.app.title,
    description: MESSAGES.app.description,
}

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
    <html lang='ko' suppressHydrationWarning>
        <body className='h-dvh overflow-hidden bg-background font-sans text-foreground antialiased'>
            <AppProviders>{children}</AppProviders>
            <Analytics />
            <SpeedInsights />
        </body>
    </html>
)

export default RootLayout

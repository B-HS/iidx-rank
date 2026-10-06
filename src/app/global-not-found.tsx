import { ThemeProvider } from 'next-themes'
import type { Metadata } from 'next'
import { NotFoundNotice } from '@features/not-found-notice/not-found-notice'
import { THEME_STORAGE_KEY } from '@shared/constants/ui'
import { routing } from '@shared/i18n/routing'
import { getLocalizedPath, NO_INDEX_ROBOTS } from '@shared/lib/seo'
import ko from '@shared/messages/ko.json'
import ja from '@shared/messages/ja.json'
import en from '@shared/messages/en.json'
import './globals.css'

const CATALOGS = { ko, ja, en }
const NOT_FOUND_STATUS_LABEL = '404'

export const metadata: Metadata = { title: `${NOT_FOUND_STATUS_LABEL} | ${ko.app.name}`, robots: NO_INDEX_ROBOTS }

const GlobalNotFound = () => (
    <html lang={routing.defaultLocale} suppressHydrationWarning>
        <body className='min-h-dvh bg-background font-sans text-foreground antialiased'>
            <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false} storageKey={THEME_STORAGE_KEY} disableTransitionOnChange>
                <NotFoundNotice
                    statusLabel={NOT_FOUND_STATUS_LABEL}
                    notices={routing.locales.map((locale) => ({
                        locale,
                        title: CATALOGS[locale].errors.notFoundTitle,
                        description: CATALOGS[locale].errors.notFoundDescription,
                        homeLabel: CATALOGS[locale].navigation.home,
                        homeHref: getLocalizedPath(locale, '/'),
                    }))}
                />
            </ThemeProvider>
        </body>
    </html>
)

export default GlobalNotFound

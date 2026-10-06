import { notFound } from 'next/navigation'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@shared/i18n/routing'
import { AppProviders } from '@shared/providers/app-providers'
import '../globals.css'

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }))
export const generateMetadata = async ({ params }: Pick<LayoutProps<'/[locale]'>, 'params'>) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) notFound()
    const t = await getTranslations({ locale, namespace: 'app' })
    return { title: { template: `%s | ${t('name')}`, default: t('title') }, description: t('description') }
}
const RootLayout = async ({ children, params }: LayoutProps<'/[locale]'>) => {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) notFound()
    return (
        <html lang={locale} suppressHydrationWarning>
            <body className='min-h-dvh bg-background md:h-dvh md:overflow-hidden font-sans text-foreground antialiased'>
                <NextIntlClientProvider>
                    <AppProviders>{children}</AppProviders>
                </NextIntlClientProvider>
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )
}
export default RootLayout

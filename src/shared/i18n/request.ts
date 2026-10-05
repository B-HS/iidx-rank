import { locale as getRootLocale } from 'next/root-params'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'
import { routing } from '@shared/i18n/routing'
import ko from '@shared/messages/ko.json'
import ja from '@shared/messages/ja.json'
import en from '@shared/messages/en.json'

const catalogs = { ko, ja, en }
const requestConfiguration = getRequestConfig(async ({ locale }) => {
    const requestedLocale = locale ?? (await getRootLocale())
    if (!hasLocale(routing.locales, requestedLocale)) notFound()
    return { locale: requestedLocale, messages: catalogs[requestedLocale], timeZone: 'Asia/Tokyo' }
})
export default requestConfiguration

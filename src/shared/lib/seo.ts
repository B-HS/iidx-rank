import type { Metadata } from 'next'
import type { Locale } from 'next-intl'
import { SITE_URL } from '@shared/constants/site'
import { routing } from '@shared/i18n/routing'

export const SEO_DESCRIPTION_MAX_LENGTH = 160
export const NO_INDEX_ROBOTS = { index: false } as const satisfies Metadata['robots']
export const OPEN_GRAPH_LOCALE = { ko: 'ko_KR', ja: 'ja_JP', en: 'en_US' } as const satisfies Record<Locale, string>

const ROOT_PATHNAME = '/'
const UNMATCHED_LANGUAGE = 'x-default'
const ELLIPSIS = '…'
const TWITTER_CARD = { SUMMARY: 'summary', LARGE_IMAGE: 'summary_large_image' } as const

type OpenGraphDetails = { type: 'article'; publishedTime: string; modifiedTime: string } | { type: 'profile'; username: string }

type PageMetadataInput = {
    locale: Locale
    pathname: string
    title: string
    description: string
    siteName: string
    isTitleAbsolute?: boolean
    openGraph?: OpenGraphDetails
    imageUrl?: string | null
    hasLargeImage?: boolean
}

/**
 * Applies the locale prefix rule of this site: the default locale has no prefix.
 * @param locale - target locale
 * @param pathname - unprefixed pathname starting with a slash, optionally with a query string
 */
export const getLocalizedPath = (locale: Locale, pathname: string) => {
    if (locale === routing.defaultLocale) return pathname

    return pathname === ROOT_PATHNAME ? `/${locale}` : `/${locale}${pathname}`
}

/**
 * Resolves a site-relative path against the canonical origin. The root path resolves to the origin without a trailing slash.
 * @param path - site-relative path starting with a slash
 */
export const getAbsoluteUrl = (path: string) => (path === ROOT_PATHNAME ? SITE_URL : `${SITE_URL}${path}`)

export const getLocalizedUrl = (locale: Locale, pathname: string) => getAbsoluteUrl(getLocalizedPath(locale, pathname))

/**
 * Builds hreflang alternates for every locale plus x-default, which points to the unprefixed URL that negotiates the locale.
 * @param pathname - unprefixed pathname starting with a slash, optionally with a query string
 */
export const getLanguageAlternates = (pathname: string) => {
    const localizedUrls: Partial<Record<Locale, string>> = Object.fromEntries(
        routing.locales.map((locale) => [locale, getLocalizedUrl(locale, pathname)]),
    )

    return { ...localizedUrls, [UNMATCHED_LANGUAGE]: getLocalizedUrl(routing.defaultLocale, pathname) }
}

export const normalizeSeoText = (text: string) => text.replace(/\s+/g, ' ').trim()

/**
 * Collapses whitespace and cuts the text at a code point boundary, ending with an ellipsis when it was shortened.
 * @param text - untrusted text such as a post body or a profile bio
 * @param maxLength - maximum number of code points including the ellipsis
 */
export const truncateSeoText = (text: string, maxLength: number) => {
    const characters = Array.from(normalizeSeoText(text))

    if (characters.length <= maxLength) return characters.join('')

    return `${characters
        .slice(0, maxLength - ELLIPSIS.length)
        .join('')
        .trimEnd()}${ELLIPSIS}`
}

export const createSeoDescription = (text: string) => truncateSeoText(text, SEO_DESCRIPTION_MAX_LENGTH)

/**
 * Builds the metadata of an indexable page: canonical, hreflang alternates, Open Graph and Twitter card.
 * Page level `openGraph` and `twitter` replace the layout defaults, so every field is repeated here.
 * @param input - locale, unprefixed canonical pathname and the page texts
 */
export const createPageMetadata = ({
    locale,
    pathname,
    title,
    description,
    siteName,
    isTitleAbsolute = false,
    openGraph,
    imageUrl = null,
    hasLargeImage = false,
}: PageMetadataInput) => {
    const url = getLocalizedUrl(locale, pathname)
    const images = imageUrl === null ? undefined : [imageUrl]

    return {
        title: isTitleAbsolute ? { absolute: title } : title,
        description,
        alternates: { canonical: url, languages: getLanguageAlternates(pathname) },
        openGraph: {
            type: 'website',
            ...openGraph,
            url,
            title,
            description,
            siteName,
            locale: OPEN_GRAPH_LOCALE[locale],
            alternateLocale: routing.locales
                .filter((alternateLocale) => alternateLocale !== locale)
                .map((alternateLocale) => OPEN_GRAPH_LOCALE[alternateLocale]),
            images,
        },
        twitter: { card: images && hasLargeImage ? TWITTER_CARD.LARGE_IMAGE : TWITTER_CARD.SUMMARY, title, description, images },
    } satisfies Metadata
}

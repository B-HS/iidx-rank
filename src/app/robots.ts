import type { MetadataRoute } from 'next'
import { routing } from '@shared/i18n/routing'
import { getAbsoluteUrl, getLocalizedPath } from '@shared/lib/seo'

const API_PATHNAME = '/api/'
const PUBLIC_FILE_PATHNAME = '/api/files/'
const NO_INDEX_PATHNAMES = ['/settings', '/board/new', '/board/*/edit']

const robots = () =>
    ({
        rules: {
            userAgent: '*',
            allow: ['/', PUBLIC_FILE_PATHNAME],
            disallow: [
                API_PATHNAME,
                ...routing.locales.flatMap((locale) => NO_INDEX_PATHNAMES.map((pathname) => getLocalizedPath(locale, pathname))),
            ],
        },
        sitemap: getAbsoluteUrl('/sitemap.xml'),
    }) satisfies MetadataRoute.Robots

export default robots

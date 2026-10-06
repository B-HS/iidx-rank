import type { MetadataRoute } from 'next'
import { connection } from 'next/server'
import { BOARD_PATHNAME, getBoardPostPathname } from '@entities/board/board-page'
import { getSitemapPosts } from '@entities/board/board.server'
import { getProfilePathname, USERS_PATHNAME } from '@entities/profile/profile-page'
import { getSitemapProfiles } from '@entities/profile/profile.server'
import { routing } from '@shared/i18n/routing'
import { getLanguageAlternates, getLocalizedUrl } from '@shared/lib/seo'

const STATIC_PATHNAMES = ['/', '/table']

const createLocalizedEntries = (pathname: string, lastModified?: string) =>
    routing.locales.map((locale) => ({
        url: getLocalizedUrl(locale, pathname),
        lastModified,
        alternates: { languages: getLanguageAlternates(pathname) },
    }))

const sitemap = async () => {
    await connection()

    const [posts, profiles] = await Promise.all([getSitemapPosts(), getSitemapProfiles()])

    return [
        ...STATIC_PATHNAMES.flatMap((pathname) => createLocalizedEntries(pathname)),
        ...createLocalizedEntries(BOARD_PATHNAME, posts[0]?.updatedAt),
        ...createLocalizedEntries(USERS_PATHNAME, profiles[0]?.updatedAt),
        ...posts.flatMap((post) => createLocalizedEntries(getBoardPostPathname(post.id), post.updatedAt)),
        ...profiles.flatMap((profile) => createLocalizedEntries(getProfilePathname(profile.handle), profile.updatedAt)),
    ] satisfies MetadataRoute.Sitemap
}

export default sitemap

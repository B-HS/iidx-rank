import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { ListedUser } from '@entities/profile/profile.dto'
import { getProfilePageTitle, getProfilePathname, getUserListPathname } from '@entities/profile/profile-page'
import { JsonLd } from '@features/json-ld/json-ld'
import { createBreadcrumbNode, createCollectionPageNode } from '@features/json-ld/json-ld-nodes'
import { getLocalizedUrl } from '@shared/lib/seo'

type UserListJsonLdProps = {
    page: number
    users: Pick<ListedUser, 'handle' | 'name'>[]
}

export const UserListJsonLd: FC<UserListJsonLdProps> = ({ page, users }) => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = getUserListPathname(page)

    return (
        <JsonLd
            nodes={[
                createCollectionPageNode({
                    locale,
                    name: t('app.name'),
                    url: getLocalizedUrl(locale, pathname),
                    title: t('navigation.users'),
                    description: t('seo.usersDescription'),
                    pages: users.map((user) => ({ name: getProfilePageTitle(user), url: getLocalizedUrl(locale, getProfilePathname(user.handle)) })),
                }),
                createBreadcrumbNode(locale, [
                    { name: t('navigation.home'), pathname: '/' },
                    { name: t('navigation.users'), pathname },
                ]),
            ]}
        />
    )
}

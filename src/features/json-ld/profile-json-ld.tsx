import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Profile } from '@entities/profile/profile.dto'
import { getProfilePageTitle, getProfilePathname } from '@entities/profile/profile-page'
import { JsonLd } from '@features/json-ld/json-ld'
import { createBreadcrumbNode, createProfilePageNode } from '@features/json-ld/json-ld-nodes'
import { getAbsoluteUrl, getLocalizedUrl } from '@shared/lib/seo'

type ProfileJsonLdProps = {
    profile: Pick<Profile, 'handle' | 'name' | 'bio' | 'avatarUrl' | 'followerCount'>
}

export const ProfileJsonLd: FC<ProfileJsonLdProps> = ({ profile }) => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = getProfilePathname(profile.handle)

    return (
        <JsonLd
            nodes={[
                createProfilePageNode({
                    locale,
                    name: t('app.name'),
                    url: getLocalizedUrl(locale, pathname),
                    profile: { ...profile, imageUrl: profile.avatarUrl === null ? null : getAbsoluteUrl(profile.avatarUrl) },
                }),
                createBreadcrumbNode(locale, [
                    { name: t('navigation.home'), pathname: '/' },
                    { name: getProfilePageTitle(profile), pathname },
                ]),
            ]}
        />
    )
}

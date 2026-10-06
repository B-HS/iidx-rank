import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { JsonLd } from '@features/json-ld/json-ld'
import { createBreadcrumbNode, createWebPageNode } from '@features/json-ld/json-ld-nodes'
import { getLocalizedUrl } from '@shared/lib/seo'

const TABLE_PATHNAME = '/table'

export const TableJsonLd: FC = () => {
    const t = useTranslations()
    const locale = useLocale()

    return (
        <JsonLd
            nodes={[
                createWebPageNode({
                    locale,
                    name: t('app.name'),
                    url: getLocalizedUrl(locale, TABLE_PATHNAME),
                    title: t('navigation.checker'),
                    description: t('checker.description'),
                }),
                createBreadcrumbNode(locale, [
                    { name: t('navigation.home'), pathname: '/' },
                    { name: t('navigation.checker'), pathname: TABLE_PATHNAME },
                ]),
            ]}
        />
    )
}

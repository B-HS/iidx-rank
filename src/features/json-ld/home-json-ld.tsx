import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { JsonLd } from '@features/json-ld/json-ld'
import { createWebSiteNode } from '@features/json-ld/json-ld-nodes'

export const HomeJsonLd: FC = () => {
    const t = useTranslations('app')
    const locale = useLocale()

    return <JsonLd nodes={[createWebSiteNode({ locale, name: t('name'), description: t('description') })]} />
}

import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { PostSummary } from '@entities/board/board.dto'
import { getBoardListPathname, getBoardPostPathname } from '@entities/board/board-page'
import { JsonLd } from '@features/json-ld/json-ld'
import { createBreadcrumbNode, createCollectionPageNode } from '@features/json-ld/json-ld-nodes'
import { getLocalizedUrl } from '@shared/lib/seo'

type BoardListJsonLdProps = {
    page: number
    posts: Pick<PostSummary, 'id' | 'title'>[]
}

export const BoardListJsonLd: FC<BoardListJsonLdProps> = ({ page, posts }) => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = getBoardListPathname(page)

    return (
        <JsonLd
            nodes={[
                createCollectionPageNode({
                    locale,
                    name: t('app.name'),
                    url: getLocalizedUrl(locale, pathname),
                    title: t('navigation.board'),
                    description: t('seo.boardDescription'),
                    pages: posts.map((post) => ({ name: post.title, url: getLocalizedUrl(locale, getBoardPostPathname(post.id)) })),
                }),
                createBreadcrumbNode(locale, [
                    { name: t('navigation.home'), pathname: '/' },
                    { name: t('navigation.board'), pathname },
                ]),
            ]}
        />
    )
}

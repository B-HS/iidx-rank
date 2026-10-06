import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { Author, Comment, Post } from '@entities/board/board.dto'
import { BOARD_PATHNAME, getBoardPostPathname } from '@entities/board/board-page'
import type { RichTextDocument } from '@entities/board/rich-text'
import { getRichTextSummary } from '@entities/board/rich-text-summary'
import { getProfilePathname } from '@entities/profile/profile-page'
import { JsonLd } from '@features/json-ld/json-ld'
import { createBreadcrumbNode, createDiscussionForumPostingNode } from '@features/json-ld/json-ld-nodes'
import { getAbsoluteUrl, getLocalizedUrl } from '@shared/lib/seo'

type BoardPostJsonLdProps = {
    post: Pick<Post, 'id' | 'title' | 'author' | 'commentCount' | 'createdAt' | 'updatedAt'>
    content: RichTextDocument | null
    comments: Pick<Comment, 'author' | 'content' | 'createdAt'>[]
}

export const BoardPostJsonLd: FC<BoardPostJsonLdProps> = ({ post, content, comments }) => {
    const t = useTranslations()
    const locale = useLocale()
    const pathname = getBoardPostPathname(post.id)
    const { text, imageSource } = getRichTextSummary(content)
    const toPerson = (author: Author) => ({
        name: author.name,
        url: author.isPublic ? getLocalizedUrl(locale, getProfilePathname(author.handle)) : null,
    })

    return (
        <JsonLd
            nodes={[
                createDiscussionForumPostingNode({
                    locale,
                    name: t('app.name'),
                    url: getLocalizedUrl(locale, pathname),
                    headline: post.title,
                    text,
                    imageUrl: imageSource === null ? null : getAbsoluteUrl(imageSource),
                    datePublished: post.createdAt,
                    dateModified: post.updatedAt,
                    author: toPerson(post.author),
                    commentCount: post.commentCount,
                    comments: comments.map((comment) => ({
                        text: comment.content,
                        datePublished: comment.createdAt,
                        author: toPerson(comment.author),
                    })),
                }),
                createBreadcrumbNode(locale, [
                    { name: t('navigation.home'), pathname: '/' },
                    { name: t('navigation.board'), pathname: BOARD_PATHNAME },
                    { name: post.title, pathname },
                ]),
            ]}
        />
    )
}

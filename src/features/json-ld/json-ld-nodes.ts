import type { Locale } from 'next-intl'
import { getLocalizedUrl, truncateSeoText } from '@shared/lib/seo'

export const JSON_LD_TEXT_MAX_LENGTH = 5000

const SCHEMA_CONTEXT = 'https://schema.org'
const INTERACTION_TYPE = { COMMENT: 'https://schema.org/CommentAction', FOLLOW: 'https://schema.org/FollowAction' } as const
const WEBSITE_ID_FRAGMENT = '#website'
const HTML_TAG_OPEN_PATTERN = /</g
const HTML_TAG_OPEN_ESCAPE = '\\u003c'

export type JsonLdValue = string | number | boolean | JsonLdValue[] | JsonLdNode
export type JsonLdNode = { [key: string]: JsonLdValue | undefined }

type SiteInput = { locale: Locale; name: string }
type PageInput = SiteInput & { url: string; title: string; description: string }
type BreadcrumbItem = { name: string; pathname: string }
type PersonInput = { name: string; url: string | null }
type CommentInput = { text: string; datePublished: string; author: PersonInput }
type ListedPageInput = { name: string; url: string }

type DiscussionForumPostingInput = SiteInput & {
    url: string
    headline: string
    text: string
    imageUrl: string | null
    datePublished: string
    dateModified: string
    author: PersonInput
    commentCount: number
    comments: CommentInput[]
}

type ProfilePageInput = SiteInput & {
    url: string
    profile: { name: string; handle: string; bio: string; imageUrl: string | null; followerCount: number }
}

const omitEmpty = <Value>(value: Value | null | '') => (value === null || value === '' ? undefined : value)

const createInteractionCounter = (interactionType: string, userInteractionCount: number) => ({
    '@type': 'InteractionCounter',
    interactionType,
    userInteractionCount,
})

const createPersonNode = ({ name, url }: PersonInput) => ({ '@type': 'Person', name, url: omitEmpty(url) })

const createCommentNode = ({ text, datePublished, author }: CommentInput) => ({
    '@type': 'Comment',
    text,
    datePublished,
    author: createPersonNode(author),
})

const createWebSiteReference = ({ locale, name }: SiteInput) => {
    const url = getLocalizedUrl(locale, '/')

    return { '@type': 'WebSite', '@id': `${url}${WEBSITE_ID_FRAGMENT}`, name, url }
}

/**
 * Serializes structured data for an inline script. Every `<` is escaped so user text cannot close the script element.
 * @param data - JSON-LD document
 */
export const serializeJsonLd = (data: JsonLdNode) => JSON.stringify(data).replace(HTML_TAG_OPEN_PATTERN, HTML_TAG_OPEN_ESCAPE)

export const createJsonLdGraph = (nodes: JsonLdNode[]) => ({ '@context': SCHEMA_CONTEXT, '@graph': nodes })

export const createWebSiteNode = ({ locale, name, description }: SiteInput & { description: string }) => ({
    ...createWebSiteReference({ locale, name }),
    description,
    inLanguage: locale,
})

export const createBreadcrumbNode = (locale: Locale, items: BreadcrumbItem[]) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: getLocalizedUrl(locale, item.pathname),
    })),
})

export const createWebPageNode = ({ locale, name, url, title, description }: PageInput) => ({
    '@type': 'WebPage',
    '@id': url,
    url,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: createWebSiteReference({ locale, name }),
})

export const createCollectionPageNode = ({ pages, ...page }: PageInput & { pages: ListedPageInput[] }) => ({
    ...createWebPageNode(page),
    '@type': 'CollectionPage',
    mainEntity: {
        '@type': 'ItemList',
        numberOfItems: pages.length,
        itemListElement: pages.map((listedPage, index) => ({ '@type': 'ListItem', position: index + 1, name: listedPage.name, url: listedPage.url })),
    },
})

export const createDiscussionForumPostingNode = ({
    locale,
    name,
    url,
    headline,
    text,
    imageUrl,
    datePublished,
    dateModified,
    author,
    commentCount,
    comments,
}: DiscussionForumPostingInput) => ({
    '@type': 'DiscussionForumPosting',
    '@id': url,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    headline,
    text: omitEmpty(truncateSeoText(text, JSON_LD_TEXT_MAX_LENGTH)),
    image: omitEmpty(imageUrl),
    datePublished,
    dateModified,
    author: createPersonNode(author),
    commentCount,
    interactionStatistic: createInteractionCounter(INTERACTION_TYPE.COMMENT, commentCount),
    comment: comments.length === 0 ? undefined : comments.map(createCommentNode),
    isPartOf: createWebSiteReference({ locale, name }),
})

export const createProfilePageNode = ({ locale, name, url, profile }: ProfilePageInput) => ({
    '@type': 'ProfilePage',
    '@id': url,
    url,
    inLanguage: locale,
    isPartOf: createWebSiteReference({ locale, name }),
    mainEntity: {
        '@type': 'Person',
        name: profile.name,
        alternateName: `@${profile.handle}`,
        identifier: profile.handle,
        url,
        description: omitEmpty(profile.bio),
        image: omitEmpty(profile.imageUrl),
        interactionStatistic: createInteractionCounter(INTERACTION_TYPE.FOLLOW, profile.followerCount),
    },
})

import { describe, expect, test } from 'bun:test'
import {
    JSON_LD_TEXT_MAX_LENGTH,
    createBreadcrumbNode,
    createCollectionPageNode,
    createDiscussionForumPostingNode,
    createJsonLdGraph,
    createProfilePageNode,
    createWebSiteNode,
    serializeJsonLd,
} from '@features/json-ld/json-ld-nodes'
import { SITE_URL } from '@shared/constants/site'

const site = { locale: 'ko', name: 'IIDX Rank' } as const
const postUrl = `${SITE_URL}/board/11111111-1111-4111-8111-111111111111`
const posting = {
    ...site,
    url: postUrl,
    headline: '제목',
    text: '본문',
    imageUrl: null,
    datePublished: '2026-10-01T00:00:00.000Z',
    dateModified: '2026-10-02T00:00:00.000Z',
    author: { name: '작성자', url: `${SITE_URL}/u/writer` },
    commentCount: 2,
    comments: [],
}

describe('JSON-LD 직렬화', () => {
    test('사용자 글이 스크립트 요소를 닫지 못하게 여는 꺾쇠를 이스케이프합니다', () => {
        const serialized = serializeJsonLd(createJsonLdGraph([{ '@type': 'Thing', name: '</script><script>alert(1)</script>' }]))

        expect(serialized).not.toContain('<')
        expect(JSON.parse(serialized)['@graph'][0].name).toBe('</script><script>alert(1)</script>')
    })

    test('값이 없는 속성은 출력하지 않습니다', () => {
        const serialized = serializeJsonLd(createJsonLdGraph([createDiscussionForumPostingNode(posting)]))

        expect(serialized).not.toContain('"image"')
        expect(serialized).not.toContain('"comment"')
    })
})

describe('사이트와 경로 노드', () => {
    test('WebSite는 로케일별 홈 주소와 언어를 가집니다', () => {
        expect(createWebSiteNode({ locale: 'ja', name: 'IIDX Rank', description: '説明' })).toEqual({
            '@type': 'WebSite',
            '@id': `${SITE_URL}/ja#website`,
            name: 'IIDX Rank',
            url: `${SITE_URL}/ja`,
            description: '説明',
            inLanguage: 'ja',
        })
    })

    test('BreadcrumbList는 순서대로 1부터 번호를 매기고 로케일 접두 주소를 씁니다', () => {
        const breadcrumb = createBreadcrumbNode('en', [
            { name: 'Home', pathname: '/' },
            { name: 'Board', pathname: '/board' },
        ])

        expect(breadcrumb.itemListElement).toEqual([
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
            { '@type': 'ListItem', position: 2, name: 'Board', item: `${SITE_URL}/en/board` },
        ])
    })

    test('CollectionPage는 목록 항목 수와 항목 주소를 담습니다', () => {
        const page = createCollectionPageNode({
            ...site,
            url: `${SITE_URL}/board`,
            title: '게시판',
            description: '설명',
            pages: [{ name: '제목', url: postUrl }],
        })

        expect(page['@type']).toBe('CollectionPage')
        expect(page.mainEntity.numberOfItems).toBe(1)
        expect(page.mainEntity.itemListElement[0]).toEqual({ '@type': 'ListItem', position: 1, name: '제목', url: postUrl })
    })
})

describe('DiscussionForumPosting', () => {
    test('작성자·작성 시각·본문과 댓글 수 통계를 담습니다', () => {
        const node = createDiscussionForumPostingNode(posting)

        expect(node['@type']).toBe('DiscussionForumPosting')
        expect(node.author).toEqual({ '@type': 'Person', name: '작성자', url: `${SITE_URL}/u/writer` })
        expect(node.datePublished).toBe(posting.datePublished)
        expect(node.dateModified).toBe(posting.dateModified)
        expect(node.text).toBe('본문')
        expect(node.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': postUrl })
        expect(node.commentCount).toBe(2)
        expect(node.interactionStatistic).toEqual({
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/CommentAction',
            userInteractionCount: 2,
        })
    })

    test('비공개 프로필 작성자는 이름만 담고 주소를 넣지 않습니다', () => {
        const node = createDiscussionForumPostingNode({ ...posting, author: { name: '작성자', url: null } })

        expect(node.author).toEqual({ '@type': 'Person', name: '작성자', url: undefined })
    })

    test('본문이 비어 있으면 text를 생략하고 이미지를 담습니다', () => {
        const imageUrl = `${SITE_URL}/api/files/board/a.png`
        const node = createDiscussionForumPostingNode({ ...posting, text: '', imageUrl })

        expect(node.text).toBeUndefined()
        expect(node.image).toBe(imageUrl)
    })

    test('본문은 상한 길이로 자릅니다', () => {
        const node = createDiscussionForumPostingNode({ ...posting, text: '가'.repeat(JSON_LD_TEXT_MAX_LENGTH + 1) })

        expect(Array.from(node.text ?? '')).toHaveLength(JSON_LD_TEXT_MAX_LENGTH)
    })

    test('댓글은 본문·작성 시각·작성자를 가진 Comment로 담습니다', () => {
        const node = createDiscussionForumPostingNode({
            ...posting,
            comments: [{ text: '댓글', datePublished: '2026-10-03T00:00:00.000Z', author: { name: '댓글 작성자', url: null } }],
        })

        expect(node.comment).toEqual([
            {
                '@type': 'Comment',
                text: '댓글',
                datePublished: '2026-10-03T00:00:00.000Z',
                author: { '@type': 'Person', name: '댓글 작성자', url: undefined },
            },
        ])
    })
})

describe('ProfilePage', () => {
    const profileUrl = `${SITE_URL}/u/tester`
    const profile = { name: '테스터', handle: 'tester', bio: '', imageUrl: null, followerCount: 3 }

    test('mainEntity는 이름·핸들·팔로워 수 통계를 가진 Person입니다', () => {
        const node = createProfilePageNode({ ...site, url: profileUrl, profile })

        expect(node['@type']).toBe('ProfilePage')
        expect(node.mainEntity).toEqual({
            '@type': 'Person',
            name: '테스터',
            alternateName: '@tester',
            identifier: 'tester',
            url: profileUrl,
            description: undefined,
            image: undefined,
            interactionStatistic: { '@type': 'InteractionCounter', interactionType: 'https://schema.org/FollowAction', userInteractionCount: 3 },
        })
    })

    test('소개와 사진이 있으면 함께 담습니다', () => {
        const imageUrl = `${SITE_URL}/api/files/avatar/a.png`
        const node = createProfilePageNode({ ...site, url: profileUrl, profile: { ...profile, bio: '소개', imageUrl } })

        expect(node.mainEntity.description).toBe('소개')
        expect(node.mainEntity.image).toBe(imageUrl)
    })
})

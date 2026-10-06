import { describe, expect, test } from 'bun:test'
import {
    SEO_DESCRIPTION_MAX_LENGTH,
    createPageMetadata,
    createSeoDescription,
    getAbsoluteUrl,
    getLanguageAlternates,
    getLocalizedPath,
    getLocalizedUrl,
    truncateSeoText,
} from '@shared/lib/seo'
import { SITE_URL } from '@shared/constants/site'

describe('로케일 접두 경로', () => {
    test('기본 로케일에는 접두를 붙이지 않습니다', () => {
        expect(getLocalizedPath('ko', '/')).toBe('/')
        expect(getLocalizedPath('ko', '/board')).toBe('/board')
    })

    test('다른 로케일은 접두를 붙이고 루트에는 끝 슬래시를 두지 않습니다', () => {
        expect(getLocalizedPath('ja', '/')).toBe('/ja')
        expect(getLocalizedPath('en', '/board?page=2')).toBe('/en/board?page=2')
    })

    test('절대 주소는 대표 주소를 기준으로 만들고 루트는 끝 슬래시 없이 반환합니다', () => {
        expect(getAbsoluteUrl('/')).toBe(SITE_URL)
        expect(getAbsoluteUrl('/api/files/board/a.png')).toBe(`${SITE_URL}/api/files/board/a.png`)
        expect(getLocalizedUrl('ja', '/')).toBe(`${SITE_URL}/ja`)
        expect(getLocalizedUrl('ko', '/table')).toBe(`${SITE_URL}/table`)
    })

    test('hreflang은 모든 로케일과 접두 없는 x-default를 포함합니다', () => {
        expect(getLanguageAlternates('/u/tester')).toEqual({
            ko: `${SITE_URL}/u/tester`,
            ja: `${SITE_URL}/ja/u/tester`,
            en: `${SITE_URL}/en/u/tester`,
            'x-default': `${SITE_URL}/u/tester`,
        })
    })
})

describe('설명 문구 정리', () => {
    test('연속 공백과 줄바꿈을 한 칸으로 줄입니다', () => {
        expect(createSeoDescription('  첫 줄\n\n둘째   줄\t끝  ')).toBe('첫 줄 둘째 줄 끝')
    })

    test('상한 이하의 글은 그대로 둡니다', () => {
        expect(truncateSeoText('가나다', 3)).toBe('가나다')
    })

    test('상한을 넘으면 줄임표를 포함해 상한 길이로 자릅니다', () => {
        const description = createSeoDescription('가'.repeat(SEO_DESCRIPTION_MAX_LENGTH + 50))

        expect(Array.from(description)).toHaveLength(SEO_DESCRIPTION_MAX_LENGTH)
        expect(description.endsWith('…')).toBe(true)
    })

    test('서로게이트 쌍으로 된 글자를 반으로 자르지 않습니다', () => {
        expect(truncateSeoText('😀😀😀😀', 3)).toBe('😀😀…')
    })
})

describe('색인 페이지 메타데이터', () => {
    const input = { locale: 'ja', pathname: '/board?page=2', title: '掲示板', description: '説明', siteName: 'IIDX Rank' } as const

    test('canonical과 og:url은 현재 로케일의 절대 주소입니다', () => {
        const metadata = createPageMetadata(input)

        expect(metadata.alternates.canonical).toBe(`${SITE_URL}/ja/board?page=2`)
        expect(metadata.openGraph.url).toBe(`${SITE_URL}/ja/board?page=2`)
        expect(metadata.alternates.languages['x-default']).toBe(`${SITE_URL}/board?page=2`)
    })

    test('Open Graph 로케일은 현재 로케일과 나머지 로케일로 나눕니다', () => {
        const metadata = createPageMetadata(input)

        expect(metadata.openGraph.locale).toBe('ja_JP')
        expect(metadata.openGraph.alternateLocale).toEqual(['ko_KR', 'en_US'])
        expect(metadata.openGraph.type).toBe('website')
    })

    test('이미지가 없으면 요약 카드를 쓰고 이미지 속성을 넣지 않습니다', () => {
        const metadata = createPageMetadata(input)

        expect(metadata.twitter.card).toBe('summary')
        expect(metadata.openGraph.images).toBeUndefined()
    })

    test('큰 이미지가 있으면 큰 이미지 카드를 씁니다', () => {
        const imageUrl = `${SITE_URL}/api/files/board/a.png`
        const metadata = createPageMetadata({ ...input, imageUrl, hasLargeImage: true })

        expect(metadata.twitter.card).toBe('summary_large_image')
        expect(metadata.openGraph.images).toEqual([imageUrl])
    })

    test('절대 제목을 요청하면 레이아웃 템플릿을 적용하지 않는 형태로 반환합니다', () => {
        expect(createPageMetadata({ ...input, isTitleAbsolute: true }).title).toEqual({ absolute: '掲示板' })
        expect(createPageMetadata(input).title).toBe('掲示板')
    })
})

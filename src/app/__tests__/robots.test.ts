import { describe, expect, test } from 'bun:test'
import robots from '@app/robots'
import { SITE_URL } from '@shared/constants/site'

describe('robots 규칙', () => {
    const { rules, sitemap } = robots()

    test('API는 막고 공개 파일 주소는 허용합니다', () => {
        expect(rules.disallow).toContain('/api/')
        expect(rules.allow).toContain('/api/files/')
    })

    test('색인 제외 경로를 모든 로케일 접두로 막습니다', () => {
        expect(rules.disallow).toEqual(
            expect.arrayContaining([
                '/settings',
                '/ja/settings',
                '/en/settings',
                '/board/new',
                '/ja/board/new',
                '/en/board/new',
                '/board/*/edit',
                '/ja/board/*/edit',
                '/en/board/*/edit',
            ]),
        )
    })

    test('sitemap 위치는 대표 주소의 절대 주소입니다', () => {
        expect(sitemap).toBe(`${SITE_URL}/sitemap.xml`)
    })
})

import { describe, expect, test } from 'bun:test'
import { compareSeriesVersions, getSeriesLogo } from '@entities/catalog/catalog-series'

const LOCALE = 'ko'
const sortVersions = (versions: string[]) => versions.toSorted((left, right) => compareSeriesVersions(left, right, LOCALE))

describe('시리즈 순서 비교', () => {
    test('수록 버전을 1st부터 최신 순으로 정렬합니다', () => {
        expect(sortVersions(['Pinky Crush', 'GOLD', '10th', 'IIDXRED', '5th', 'HAPPY SKY', 'DJ TROOPERS', '9th'])).toEqual([
            '5th',
            '9th',
            '10th',
            'IIDXRED',
            'HAPPY SKY',
            'GOLD',
            'DJ TROOPERS',
            'Pinky Crush',
        ])
    })

    test('표기가 달라도 같은 시리즈로 비교합니다', () => {
        expect(sortVersions(['Rootage', 'CANNON BALLERS', '2nd style', '1st Style'])).toEqual(['1st Style', '2nd style', 'CANNON BALLERS', 'Rootage'])
        expect(compareSeriesVersions('Cannon_Ballers', 'SINOBUZ', LOCALE)).toBeGreaterThan(0)
        expect(compareSeriesVersions('cannon-ballers', 'Rootage', LOCALE)).toBeLessThan(0)
        expect(getSeriesLogo('Resort Anthem')).toBe(getSeriesLogo('resort-anthem'))
    })

    test('등록되지 않은 버전은 맨 뒤에 사전순으로 둡니다', () => {
        expect(sortVersions(['substream', 'EPOLIS', 'INFINITAS', '1st'])).toEqual(['1st', 'EPOLIS', 'INFINITAS', 'substream'])
        expect(compareSeriesVersions('substream', 'substream', LOCALE)).toBe(0)
        expect(getSeriesLogo('substream')).toBeNull()
    })
})

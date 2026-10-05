import { readFileSync } from 'node:fs'
import { describe, expect, test } from 'bun:test'
import { CatalogParseError, parseCatalogSources } from '@entities/catalog/catalog.parser'

const normalHtml = readFileSync(new URL('./fixtures/catalog-normal.html', import.meta.url), 'utf8')
const hardHtml = readFileSync(new URL('./fixtures/catalog-hard.html', import.meta.url), 'utf8')
const introHtml = readFileSync(new URL('./fixtures/catalog-intro.html', import.meta.url), 'utf8')
const fetchedAt = '2026-10-05T00:00:00.000Z'

describe('Google Sheets 원본 파서', () => {
    test('실제 원본 HTML에서 표시 곡 수와 안내 갱신일을 읽습니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)

        expect(catalog.charts).toHaveLength(666)
        expect(catalog.source.chartCount).toBe(666)
        expect(catalog.source.updatedAt).toBe('2026-09-24')
        expect(new Set(catalog.charts.map((chart) => chart.id)).size).toBe(666)
    })

    test('개인차 색상을 상속과 명시적 검정 덮어쓰기로 판별합니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)
        const adularia = catalog.charts.find((chart) => chart.title === 'Adularia')
        const ancientScapes = catalog.charts.find((chart) => chart.title === 'Ancient Scapes')

        expect(adularia?.normalPersonal).toBe(true)
        expect(ancientScapes?.normalPersonal).toBe(false)
    })

    test('마젠타 L 접미사를 개인차 색상으로 세지 않고 접미사로 난이도를 구분합니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)
        const madAttack = catalog.charts.find((chart) => chart.title === 'snow storm')

        expect(madAttack?.difficulty).toBe('L')
        expect(madAttack?.normalPersonal).toBe(false)
    })

    test('같은 곡의 노마게와 하드 랭크를 독립적으로 유지합니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)
        const adularia = catalog.charts.find((chart) => chart.title === 'Adularia')

        expect(adularia?.normalRank).toBe('C')
        expect(adularia?.hardRank).toBe('D')
    })

    test('같은 제목의 HYPER와 ANOTHER에 별도 ID를 만듭니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)
        const charts = catalog.charts.filter((chart) => chart.title === 'gigadelic')
        const difficulties = new Set(charts.map((chart) => chart.difficulty))
        const ids = new Set(charts.map((chart) => chart.id))

        expect(difficulties).toEqual(new Set(['H', 'A']))
        expect(ids.size).toBe(2)
    })

    test('전각 플러스 랭크와 출처 간 명시적 곡명 별칭을 정규화합니다', () => {
        const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, fetchedAt)
        const hasFullwidthPlusRank = catalog.charts.some((chart) => chart.normalRank === 'B+')
        const aliasedChart = catalog.charts.find((chart) => chart.title === 'Life Is A Game ft.DD"ナカタ"Metal"')

        expect(hasFullwidthPlusRank).toBe(true)
        expect(aliasedChart?.hardRank).not.toBeNull()
    })

    test('표시 곡 수가 실제 곡 수와 다르면 동기화를 거부합니다', () => {
        const malformedNormalHtml = normalHtml.replaceAll('666譜面', '667譜面')

        expect(() => parseCatalogSources(malformedNormalHtml, hardHtml, introHtml, fetchedAt)).toThrow(CatalogParseError)
    })

    test('누락된 표 구조는 동기화를 거부합니다', () => {
        expect(() => parseCatalogSources('<html><body><table></table></body></html>', hardHtml, introHtml, fetchedAt)).toThrow(CatalogParseError)
    })
})

import { describe, expect, test } from 'bun:test'
import { ExtensionSessionSchema, ImportInputSchema } from '@entities/eamusement/eamusement.dto'
import { IMPORT_MAX_CHARTS, IMPORT_PLAYER_TEXT_MAX_LENGTH, IMPORT_TITLE_MAX_LENGTH } from '@shared/constants/eamusement'

const CHART = {
    chartId: 'chart-6d4d8c5dd256f3870c3527063b541f01',
    title: '冥',
    difficulty: 'A',
    level: 12,
    lamp: 'FULL_COMBO',
    scoreGrade: 'AAA',
    exScore: 3123,
    missCount: 2,
}
const PLAYER = { djName: '-TEST-', iidxId: '1234-5678', danRank: '十段', djPoint: 1234.56, playCountSp: 432, playCountDp: 123 }
const NOTES_RADAR = { NOTES: 128.45, CHORD: 131.22, PEAK: 118.9, CHARGE: 142, SCRATCH: 136.75, 'SOF-LAN': 124.1 }
const VALID_INPUT = {
    version: 2,
    kind: 'iidx-rank-import',
    generatedAt: '2026-10-07T10:05:00.000Z',
    gameVersion: 34,
    style: 0,
    player: PLAYER,
    notesRadar: NOTES_RADAR,
    charts: [CHART],
}

const isValid = (input: unknown) => ImportInputSchema.safeParse(input).success

describe('rank-import v2 입력 스키마', () => {
    test('계약 예시 본문을 그대로 통과시킵니다', () => {
        expect<unknown>(ImportInputSchema.parse(VALID_INPUT)).toEqual(VALID_INPUT)
    })
    test('player·notesRadar가 null이거나 차트가 0건이어도 허용합니다', () => {
        expect(isValid({ ...VALID_INPUT, player: null, notesRadar: null, charts: [] })).toBe(true)
        expect(isValid({ ...VALID_INPUT, player: { ...PLAYER, djName: null, djPoint: null }, notesRadar: { ...NOTES_RADAR, PEAK: null } })).toBe(true)
        expect(isValid({ ...VALID_INPUT, charts: [{ ...CHART, lamp: 'NO_PLAY', scoreGrade: null, exScore: null, missCount: null }] })).toBe(true)
    })
    test('version·kind가 다르면 거부합니다', () => {
        expect(isValid({ ...VALID_INPUT, version: 1 })).toBe(false)
        expect(isValid({ ...VALID_INPUT, kind: 'iidx-rank-export' })).toBe(false)
    })
    test('style은 0과 1만 스키마를 통과합니다', () => {
        expect(isValid({ ...VALID_INPUT, style: 1 })).toBe(true)
        expect(isValid({ ...VALID_INPUT, style: 2 })).toBe(false)
    })
    test('모르는 필드는 어느 깊이에서든 거부합니다', () => {
        expect(isValid({ ...VALID_INPUT, userId: '3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b' })).toBe(false)
        expect(isValid({ ...VALID_INPUT, player: { ...PLAYER, email: 'a@example.com' } })).toBe(false)
        expect(isValid({ ...VALID_INPUT, notesRadar: { ...NOTES_RADAR, EXTRA: 1 } })).toBe(false)
        expect(isValid({ ...VALID_INPUT, charts: [{ ...CHART, memo: '메모' }] })).toBe(false)
    })
    test('누락된 필드는 null로 간주하지 않고 거부합니다', () => {
        expect(isValid({ ...VALID_INPUT, charts: [{ ...CHART, exScore: undefined }] })).toBe(false)
        expect(isValid({ ...VALID_INPUT, player: { ...PLAYER, danRank: undefined } })).toBe(false)
        expect(isValid({ ...VALID_INPUT, notesRadar: undefined })).toBe(false)
    })
    test('차트 필드의 형식과 범위를 검증합니다', () => {
        const invalidCharts = [
            { ...CHART, chartId: 'chart-XYZ' },
            { ...CHART, title: '' },
            { ...CHART, title: 'a'.repeat(IMPORT_TITLE_MAX_LENGTH + 1) },
            { ...CHART, difficulty: 'X' },
            { ...CHART, level: 0 },
            { ...CHART, level: 13 },
            { ...CHART, level: 11.5 },
            { ...CHART, lamp: 'PERFECT' },
            { ...CHART, scoreGrade: 'MAX' },
            { ...CHART, exScore: -1 },
            { ...CHART, missCount: 1.5 },
        ]

        for (const chart of invalidCharts) expect(isValid({ ...VALID_INPUT, charts: [chart] })).toBe(false)
        for (const difficulty of ['B', 'N', 'H', 'A', 'L']) expect(isValid({ ...VALID_INPUT, charts: [{ ...CHART, difficulty }] })).toBe(true)
    })
    test('플레이어 문자열 길이와 노트레이더 음수를 거부합니다', () => {
        expect(isValid({ ...VALID_INPUT, player: { ...PLAYER, djName: 'a'.repeat(IMPORT_PLAYER_TEXT_MAX_LENGTH) } })).toBe(true)
        expect(isValid({ ...VALID_INPUT, player: { ...PLAYER, djName: 'a'.repeat(IMPORT_PLAYER_TEXT_MAX_LENGTH + 1) } })).toBe(false)
        expect(isValid({ ...VALID_INPUT, notesRadar: { ...NOTES_RADAR, NOTES: -0.01 } })).toBe(false)
    })
    test('generatedAt·gameVersion 형식을 검증합니다', () => {
        expect(isValid({ ...VALID_INPUT, generatedAt: '2026-10-07 10:05:00' })).toBe(false)
        expect(isValid({ ...VALID_INPUT, gameVersion: 0 })).toBe(false)
    })
    test('차트는 최대 건수까지만 허용합니다', () => {
        expect(isValid({ ...VALID_INPUT, charts: Array.from({ length: IMPORT_MAX_CHARTS }, () => CHART) })).toBe(true)
        expect(isValid({ ...VALID_INPUT, charts: Array.from({ length: IMPORT_MAX_CHARTS + 1 }, () => CHART) })).toBe(false)
    })
})

describe('익스텐션 세션 응답 스키마', () => {
    test('세션이 없으면 user가 null입니다', () => {
        expect(ExtensionSessionSchema.parse({ user: null })).toEqual({ user: null })
    })
    test('id·name·handle 외의 필드는 응답에서 제거합니다', () => {
        const user = { id: '3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b', name: '닉네임', handle: 'iidx_player' }

        expect(ExtensionSessionSchema.parse({ user: { ...user, email: 'a@example.com', token: 'secret' } })).toEqual({ user })
    })
})

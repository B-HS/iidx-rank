import { describe, expect, test } from 'bun:test'
import { parseImportFile, parseImportText } from '@entities/eamusement/eamusement-file'
import { IMPORT_MAX_BODY_BYTES } from '@shared/constants/eamusement'

const VALID_INPUT = {
    version: 2,
    kind: 'iidx-rank-import',
    generatedAt: '2026-10-07T10:05:00.000Z',
    gameVersion: 34,
    style: 0,
    player: null,
    notesRadar: null,
    charts: [],
}

describe('가져오기 파일 파싱', () => {
    test('올바른 본문은 VALID와 파싱된 입력을 돌려줍니다', () => {
        const result = parseImportText(JSON.stringify(VALID_INPUT))

        expect(result.status).toBe('VALID')
    })
    test('JSON이 아니면 MALFORMED입니다', () => {
        expect(parseImportText('{').status).toBe('MALFORMED')
    })
    test('객체가 아니면 INVALID입니다', () => {
        expect(parseImportText('[]').status).toBe('INVALID')
        expect(parseImportText('null').status).toBe('INVALID')
    })
    test('버전이 다르면 VERSION_MISMATCH입니다', () => {
        expect(parseImportText(JSON.stringify({ ...VALID_INPUT, version: 1 })).status).toBe('VERSION_MISMATCH')
    })
    test('DP 파일은 UNSUPPORTED_STYLE입니다', () => {
        expect(parseImportText(JSON.stringify({ ...VALID_INPUT, style: 1 })).status).toBe('UNSUPPORTED_STYLE')
    })
    test('모르는 필드나 잘못된 값은 INVALID입니다', () => {
        expect(parseImportText(JSON.stringify({ ...VALID_INPUT, extra: true })).status).toBe('INVALID')
        expect(parseImportText(JSON.stringify({ ...VALID_INPUT, kind: 'other' })).status).toBe('INVALID')
        expect(parseImportText(JSON.stringify({ title: 'x' })).status).toBe('INVALID')
    })
    test('크기 제한을 넘으면 내용을 읽지 않고 TOO_LARGE입니다', async () => {
        const result = await parseImportFile({ size: IMPORT_MAX_BODY_BYTES + 1, text: () => Promise.reject(new Error('read')) })

        expect(result.status).toBe('TOO_LARGE')
    })
    test('읽기에 실패하면 MALFORMED입니다', async () => {
        const result = await parseImportFile({ size: 1, text: () => Promise.reject(new Error('read')) })

        expect(result.status).toBe('MALFORMED')
    })
})

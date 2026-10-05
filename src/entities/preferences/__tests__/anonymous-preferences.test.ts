import { describe, expect, test } from 'bun:test'
import { parseAnonymousPreferences } from '@entities/preferences/anonymous-preferences.dto'
import { ANONYMOUS_PREFERENCES_MAX_LENGTH, VERSION_DISPLAYS } from '@shared/constants/display'
describe('비로그인 표시 설정 복원', () => {
    test('저장된 로고·시리즈명과 불투명도를 복원합니다', () => {
        for (const versionDisplay of VERSION_DISPLAYS)
            expect(parseAnonymousPreferences(JSON.stringify({ versionDisplay, logoOpacity: 25 }))).toEqual({ versionDisplay, logoOpacity: 25 })
    })
    test('누락·잘못된 JSON·잘못된 값은 초기값 처리 대상입니다', () => {
        for (const value of [
            null,
            undefined,
            '{',
            'null',
            '[]',
            '{}',
            '{"versionDisplay":"unknown","logoOpacity":10}',
            '{"versionDisplay":"logo","logoOpacity":101}',
        ])
            expect(parseAnonymousPreferences(value)).toBeNull()
    })
    test('허용 크기를 넘는 브라우저 값은 파싱하지 않습니다', () => {
        expect(parseAnonymousPreferences(' '.repeat(ANONYMOUS_PREFERENCES_MAX_LENGTH + 1))).toBeNull()
    })
})

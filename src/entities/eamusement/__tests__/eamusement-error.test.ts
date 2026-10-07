import { describe, expect, test } from 'bun:test'
import { getHandoffErrorKey, getImportErrorKey, getImportFileErrorKey } from '@entities/eamusement/eamusement-error'

describe('가져오기 오류 안내', () => {
    test('파일 검증 결과를 구분해 안내합니다', () => {
        expect(getImportFileErrorKey('UNSUPPORTED_STYLE')).toBe('settings.eamusementFileDp')
        expect(getImportFileErrorKey('VERSION_MISMATCH')).toBe('settings.eamusementFileVersionMismatch')
        expect(getImportFileErrorKey('INVALID')).toBe('settings.eamusementFileInvalid')
    })
    test('서버 오류 코드를 구분하고 모르는 코드는 일반 오류로 안내합니다', () => {
        expect(getImportErrorKey('IMPORT_COOLDOWN')).toBe('settings.eamusementImportCooldown')
        expect(getImportErrorKey('UNSUPPORTED_STYLE')).toBe('settings.eamusementFileDp')
        expect(getImportErrorKey('REQUEST_FAILED')).toBe('settings.eamusementImportError')
    })
    test('익스텐션 반영 화면은 파일 대신 넘겨받은 데이터를 기준으로 안내하고 나머지는 서버 오류 안내를 그대로 씁니다', () => {
        expect(getHandoffErrorKey('INVALID_PAYLOAD')).toBe('import.errorInvalidPayload')
        expect(getHandoffErrorKey('INVALID_INPUT')).toBe('import.errorInvalidPayload')
        expect(getHandoffErrorKey('UNSUPPORTED_STYLE')).toBe('import.errorDp')
        expect(getHandoffErrorKey('PAYLOAD_TOO_LARGE')).toBe('import.errorTooLarge')
        expect(getHandoffErrorKey('IMPORT_COOLDOWN')).toBe('settings.eamusementImportCooldown')
        expect(getHandoffErrorKey('AUTH_REQUIRED')).toBe('settings.eamusementImportAuthRequired')
        expect(getHandoffErrorKey('REQUEST_FAILED')).toBe('settings.eamusementImportError')
    })
})

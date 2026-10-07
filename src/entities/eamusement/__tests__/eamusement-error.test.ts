import { describe, expect, test } from 'bun:test'
import { getImportErrorKey, getImportFileErrorKey } from '@entities/eamusement/eamusement-error'

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
})

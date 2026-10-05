import { describe, expect, test } from 'bun:test'
import { getAuthErrorKey } from '@entities/auth/auth-error'
describe('가입 오류 안내', () => {
    test('허용 출처 실패를 계정 확인 오류와 구분합니다', () => {
        expect(getAuthErrorKey({ status: 403, code: 'INVALID_ORIGIN' })).toBe('auth.originRejected')
    })
    test('중복 이메일·입력·로그인 실패를 구분합니다', () => {
        expect(getAuthErrorKey({ status: 422, code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' })).toBe('auth.emailExists')
        expect(getAuthErrorKey({ status: 400, code: 'PASSWORD_TOO_SHORT' })).toBe('auth.passwordTooShort')
        expect(getAuthErrorKey({ status: 401, code: 'INVALID_EMAIL_OR_PASSWORD' })).toBe('auth.invalidCredentials')
    })
    test('오류 코드가 없어도 제한·서버 오류를 안내합니다', () => {
        expect(getAuthErrorKey({ status: 429 })).toBe('auth.rateLimited')
        expect(getAuthErrorKey({ status: 503 })).toBe('auth.serviceUnavailable')
        expect(getAuthErrorKey({ status: 400 })).toBe('auth.authError')
    })
})

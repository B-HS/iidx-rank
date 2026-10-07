import { describe, expect, test } from 'bun:test'
import { getAuthErrorKey, getSocialAuthErrorKey } from '@entities/auth/auth-error'
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
describe('외부 로그인 오류 안내', () => {
    test('계정 연결 불가·취소·이메일 없음을 구분합니다', () => {
        expect(getSocialAuthErrorKey('account_not_linked')).toBe('auth.socialAccountNotLinked')
        expect(getSocialAuthErrorKey('access_denied')).toBe('auth.socialCancelled')
        expect(getSocialAuthErrorKey('email_not_found')).toBe('auth.socialEmailMissing')
    })
    test('알 수 없는 코드는 일반 오류로 안내합니다', () => {
        expect(getSocialAuthErrorKey('state_mismatch')).toBe('auth.socialError')
        expect(getSocialAuthErrorKey('')).toBe('auth.socialError')
    })
})

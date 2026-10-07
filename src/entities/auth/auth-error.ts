import type { authClient } from '@entities/auth/auth.api'
import { AUTH_ERROR_STATUS } from '@shared/constants/auth'

type AuthResponseError = NonNullable<Awaited<ReturnType<typeof authClient.signUp.email>>['error']>
type AuthError = Pick<AuthResponseError, 'status'> & Partial<Pick<AuthResponseError, 'code'>>

export const getAuthErrorKey = (error: AuthError) => {
    if (error.status === AUTH_ERROR_STATUS.RATE_LIMITED) return 'auth.rateLimited'
    if (error.status >= AUTH_ERROR_STATUS.SERVER_ERROR) return 'auth.serviceUnavailable'
    if (error.code === 'INVALID_ORIGIN' || error.code === 'INVALID_BASE_URL') return 'auth.originRejected'
    if (error.code === 'USER_ALREADY_EXISTS' || error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') return 'auth.emailExists'
    if (error.code === 'INVALID_EMAIL') return 'auth.emailInvalid'
    if (error.code === 'PASSWORD_TOO_SHORT') return 'auth.passwordTooShort'
    if (error.code === 'PASSWORD_TOO_LONG') return 'auth.passwordTooLong'
    if (error.code === 'INVALID_EMAIL_OR_PASSWORD' || error.code === 'INVALID_PASSWORD') return 'auth.invalidCredentials'
    if (error.code === 'FAILED_TO_CREATE_USER' || error.code === 'FAILED_TO_CREATE_SESSION') return 'auth.serviceUnavailable'
    return 'auth.authError'
}

type SocialAuthErrorKey = 'auth.socialAccountNotLinked' | 'auth.socialCancelled' | 'auth.socialEmailMissing' | 'auth.socialError'

const SOCIAL_AUTH_ERROR_KEYS = new Map<string, SocialAuthErrorKey>([
    ['account_not_linked', 'auth.socialAccountNotLinked'],
    ['unable_to_link_account', 'auth.socialAccountNotLinked'],
    ['account_already_linked_to_different_user', 'auth.socialAccountNotLinked'],
    ['email_does_not_match', 'auth.socialAccountNotLinked'],
    ['access_denied', 'auth.socialCancelled'],
    ['email_not_found', 'auth.socialEmailMissing'],
    ['email_not_verified', 'auth.socialEmailMissing'],
])

export const getSocialAuthErrorKey = (code: string) => SOCIAL_AUTH_ERROR_KEYS.get(code) ?? 'auth.socialError'

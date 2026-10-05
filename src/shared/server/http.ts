import { getEnv } from '@shared/server/env'

export const API_STATUS = {
    OK: 200,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    TOO_MANY_REQUESTS: 429,
    PAYLOAD_TOO_LARGE: 413,
    UNSUPPORTED_MEDIA_TYPE: 415,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const

const PRIVATE_NO_STORE_HEADERS = { 'Cache-Control': 'private, no-store' }

export const isTrustedOrigin = (origin: string | null) => origin === new URL(getEnv().BETTER_AUTH_URL).origin

export const successResponse = <T>(data: T, status: number = API_STATUS.OK, headers: HeadersInit = PRIVATE_NO_STORE_HEADERS) =>
    Response.json({ success: true, data }, { status, headers })

export const errorResponse = (code: string, message: string, status: number = API_STATUS.BAD_REQUEST) =>
    Response.json({ success: false, error: { code, message } }, { status, headers: PRIVATE_NO_STORE_HEADERS })

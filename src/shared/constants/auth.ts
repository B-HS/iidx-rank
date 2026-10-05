export const AUTH_PASSWORD_MIN_LENGTH = 8
export const AUTH_PASSWORD_MAX_LENGTH = 128
export const AUTH_PRODUCTION_ORIGINS = ['https://iidx-rank.vercel.app', 'https://iidx.hyns.dev'] as const

export const AUTH_ERROR_STATUS = { RATE_LIMITED: 429, SERVER_ERROR: 500 } as const

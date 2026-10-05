import { AUTH_PRODUCTION_ORIGINS } from '@shared/constants/auth'
import { getEnv } from '@shared/server/env'

export const getAuthOrigins = () => {
    const configuredOrigin = new URL(getEnv().BETTER_AUTH_URL).origin
    if (AUTH_PRODUCTION_ORIGINS.some((origin) => origin === configuredOrigin)) return [...AUTH_PRODUCTION_ORIGINS]
    return [configuredOrigin]
}

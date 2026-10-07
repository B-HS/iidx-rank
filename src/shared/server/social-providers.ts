import 'server-only'
import { SOCIAL_PROVIDERS } from '@shared/constants/auth'
import { getEnv } from '@shared/server/env'

export const getSocialProviderCredentials = () => {
    const env = getEnv()

    return {
        github: env.GITHUB_CLIENT_ID && env.GITHUB_SECRET_KEY ? { clientId: env.GITHUB_CLIENT_ID, clientSecret: env.GITHUB_SECRET_KEY } : null,
        naver: env.NAVER_CLIENT_ID && env.NAVER_SECRET_KEY ? { clientId: env.NAVER_CLIENT_ID, clientSecret: env.NAVER_SECRET_KEY } : null,
    }
}

export const getEnabledSocialProviders = () => {
    const credentials = getSocialProviderCredentials()

    return SOCIAL_PROVIDERS.filter((provider) => credentials[provider] !== null)
}

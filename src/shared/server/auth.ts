import { headers } from 'next/headers'
import 'server-only'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { getSessionCookie } from 'better-auth/cookies'
import { oAuthProxy } from 'better-auth/plugins'
import type { NaverProfile } from 'better-auth/social-providers'
import { ensureUserProfile } from '@entities/profile/user-summary.server'
import { getAuthOrigins } from '@shared/server/auth-origins'
import { USER_ROLE } from '@shared/constants/user-role'
import { account, session, user, verification } from '@shared/server/db/auth-schema'
import { getDb } from '@shared/server/db/get-db'
import { getEnv } from '@shared/server/env'
import { getSocialProviderCredentials } from '@shared/server/social-providers'

const EMAIL_LOCAL_PART_SEPARATOR = '@'

const createSocialProviders = () => {
    const { github, naver } = getSocialProviderCredentials()

    return {
        ...(github ? { github } : {}),
        ...(naver
            ? {
                  naver: {
                      ...naver,
                      mapProfileToUser: ({ response }: NaverProfile) => ({
                          name: response.name || response.nickname || response.email?.split(EMAIL_LOCAL_PART_SEPARATOR, 1)[0] || '',
                      }),
                  },
              }
            : {}),
    }
}

const createAuthInstance = (env: ReturnType<typeof getEnv>) =>
    betterAuth({
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        trustedOrigins: getAuthOrigins(),
        database: drizzleAdapter(getDb(), {
            provider: 'sqlite',
            schema: { user, session, account, verification },
        }),
        emailAndPassword: { enabled: true },
        account: { encryptOAuthTokens: true },
        socialProviders: createSocialProviders(),
        plugins: [oAuthProxy({ productionURL: env.BETTER_AUTH_URL })],
        user: {
            additionalFields: { role: { type: [USER_ROLE.USER, USER_ROLE.ADMIN], required: false, defaultValue: USER_ROLE.USER, input: false } },
        },
        databaseHooks: {
            user: {
                create: {
                    before: async (data) => ({
                        data: { ...data, role: env.ADMIN_BOOTSTRAP_EMAILS.includes(data.email.toLowerCase()) ? USER_ROLE.ADMIN : USER_ROLE.USER },
                    }),
                    after: async (createdUser) => {
                        try {
                            await ensureUserProfile(createdUser.id)
                        } catch {
                            return
                        }
                    },
                },
            },
        },
        rateLimit: { enabled: true },
        advanced: { database: { generateId: 'uuid' } },
    })

type AuthInstance = ReturnType<typeof createAuthInstance>

let authInstance: AuthInstance | undefined

export const getAuth = () => {
    if (authInstance) return authInstance

    const env = getEnv()

    if (!env.BETTER_AUTH_SECRET) throw new Error('BETTER_AUTH_SECRET is required and must contain at least 32 characters.')

    const instance = createAuthInstance(env)
    authInstance = instance

    return instance
}

export const getSession = async () => {
    const requestHeaders = await headers()
    if (!getSessionCookie(requestHeaders)) return null

    return await getAuth().api.getSession({ headers: requestHeaders })
}

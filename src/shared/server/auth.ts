import 'server-only'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { betterAuth } from 'better-auth'
import { getSessionCookie } from 'better-auth/cookies'
import { headers } from 'next/headers'
import { account, session, user, verification } from '@shared/server/db/auth-schema'
import { getDb } from '@shared/server/db/get-db'
import { getEnv } from '@shared/server/env'

const createAuthInstance = (env: ReturnType<typeof getEnv>) =>
    betterAuth({
        baseURL: env.BETTER_AUTH_URL,
        secret: env.BETTER_AUTH_SECRET,
        trustedOrigins: [new URL(env.BETTER_AUTH_URL).origin],
        database: drizzleAdapter(getDb(), {
            provider: 'sqlite',
            schema: { user, session, account, verification },
        }),
        emailAndPassword: { enabled: true },
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

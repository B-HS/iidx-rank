import { z } from 'zod'

const DEFAULT_DATABASE_URL = 'file:./data/iidx.db'
const DEFAULT_BETTER_AUTH_URL = 'http://localhost:3000'

const envSchema = z.object({
    DATABASE_URL: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).default(DEFAULT_DATABASE_URL)),
    BETTER_AUTH_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().default(DEFAULT_BETTER_AUTH_URL)),
    BETTER_AUTH_SECRET: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(32).optional()),
    TURSO_AUTH_TOKEN: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional()),
})

let environment: z.infer<typeof envSchema> | undefined

export const getEnv = () => {
    if (environment) return environment

    environment = envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    })

    return environment
}

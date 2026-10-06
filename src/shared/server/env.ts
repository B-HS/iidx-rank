import { z } from 'zod'

const DEFAULT_DATABASE_URL = 'file:./data/iidx.db'
const DEFAULT_BETTER_AUTH_URL = 'http://localhost:3000'

const envSchema = z.object({
    DATABASE_URL: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).default(DEFAULT_DATABASE_URL)),
    BETTER_AUTH_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().default(DEFAULT_BETTER_AUTH_URL)),
    BETTER_AUTH_SECRET: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(32).optional()),
    ADMIN_BOOTSTRAP_EMAILS: z
        .string()
        .default('')
        .transform((value) =>
            z.array(z.email()).parse(
                value
                    .split(',')
                    .map((email) => email.trim().toLowerCase())
                    .filter(Boolean),
            ),
        ),
    CRON_SECRET: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(32).optional()),
    TURSO_AUTH_TOKEN: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional()),
    R2_ACCESS_KEY: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional()),
    R2_SECRET_KEY: z.preprocess((value) => (value === '' ? undefined : value), z.string().min(1).optional()),
    R2_URL: z.preprocess((value) => (value === '' ? undefined : value), z.url().optional()),
})

let environment: z.infer<typeof envSchema> | undefined

export const getEnv = () => {
    if (environment) return environment

    environment = envSchema.parse({
        DATABASE_URL: process.env.DATABASE_URL,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
        ADMIN_BOOTSTRAP_EMAILS: process.env.ADMIN_BOOTSTRAP_EMAILS,
        CRON_SECRET: process.env.CRON_SECRET,
        R2_ACCESS_KEY: process.env.R2_ACCESS_KEY,
        R2_SECRET_KEY: process.env.R2_SECRET_KEY,
        R2_URL: process.env.R2_URL,
    })

    return environment
}

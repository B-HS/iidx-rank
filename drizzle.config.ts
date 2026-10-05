import { defineConfig } from 'drizzle-kit'
import { getEnv } from './src/shared/server/env'

const env = getEnv()
const databaseConfiguration = env.DATABASE_URL.startsWith('libsql://')
    ? { dialect: 'turso' as const, dbCredentials: { url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN } }
    : { dialect: 'sqlite' as const, dbCredentials: { url: env.DATABASE_URL } }

export default defineConfig({
    ...databaseConfiguration,
    out: './drizzle',
    schema: './src/shared/server/db/*-schema.ts',
})

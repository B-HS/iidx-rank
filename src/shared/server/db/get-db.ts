import { mkdirSync } from 'node:fs'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import type { Client } from '@libsql/client'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { account, session, user, verification } from '@shared/server/db/auth-schema'
import { catalogCharts, catalogSource } from '@shared/server/db/catalog-schema'
import { userRecord, userRecordRevision } from '@shared/server/db/checker-schema'
import { userDisplayPreference } from '@shared/server/db/preferences-schema'
import { getEnv } from '@shared/server/env'

const LOCAL_DATABASE_DIRECTORY = 'data'

const databaseSchema = {
    user,
    session,
    account,
    verification,
    userRecord,
    userRecordRevision,
    userDisplayPreference,
    catalogCharts,
    catalogSource,
}

type Database = LibSQLDatabase<typeof databaseSchema> & { $client: Client }

let database: Database | undefined

export const getDb = () => {
    if (database) return database

    const env = getEnv()

    if (env.DATABASE_URL.startsWith('file:./data/')) mkdirSync(LOCAL_DATABASE_DIRECTORY, { recursive: true })

    const client = createClient({ url: env.DATABASE_URL, authToken: env.TURSO_AUTH_TOKEN })
    database = drizzle(client, { schema: databaseSchema })

    return database
}

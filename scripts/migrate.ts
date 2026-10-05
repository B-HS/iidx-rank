import { migrate } from 'drizzle-orm/libsql/migrator'
import { getDb } from '@shared/server/db/get-db'

const database = getDb()

try {
    await migrate(database, { migrationsFolder: 'drizzle' })
} finally {
    database.$client.close()
}

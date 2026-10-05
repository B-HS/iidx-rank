import { inArray } from 'drizzle-orm'
import { USER_ROLE } from '@shared/constants/user-role'
import { user } from '@shared/server/db/auth-schema'
import { getDb } from '@shared/server/db/get-db'
import { getEnv } from '@shared/server/env'

const emails = getEnv().ADMIN_BOOTSTRAP_EMAILS
if (emails.length > 0) {
    const database = getDb()
    try {
        await database.update(user).set({ role: USER_ROLE.ADMIN }).where(inArray(user.email, emails))
    } finally {
        database.$client.close()
    }
}

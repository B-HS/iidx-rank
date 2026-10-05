import { z } from 'zod'
import { eq, count } from 'drizzle-orm'
import { getDb } from '@shared/server/db/get-db'
import { user, account, session, verification } from '@shared/server/db/auth-schema'
import { userRecord, userRecordRevision } from '@shared/server/db/checker-schema'
import { userDisplayPreference } from '@shared/server/db/preferences-schema'

const email = z.email().parse(Bun.argv[2])
const operation = z.enum(['audit', 'delete']).parse(Bun.argv[3] ?? 'audit')
const database = getDb()
try {
    const matches = await database.select({ id: user.id }).from(user).where(eq(user.email, email))
    const target = matches[0]
    if (!target) {
        console.info(JSON.stringify({ matches: 0 }))
        process.exitCode = 0
    }
    if (target) {
        const records = await database.select({ total: count() }).from(userRecord).where(eq(userRecord.userId, target.id))
        const accounts = await database.select({ total: count() }).from(account).where(eq(account.userId, target.id))
        const sessions = await database.select({ total: count() }).from(session).where(eq(session.userId, target.id))
        console.info(
            JSON.stringify({
                matches: matches.length,
                records: records[0]?.total,
                authAccounts: accounts[0]?.total,
                sessions: sessions[0]?.total,
                operation,
            }),
        )
        if (operation === 'delete') {
            await database.transaction(async (transaction) => {
                await transaction.delete(session).where(eq(session.userId, target.id))
                await transaction.delete(account).where(eq(account.userId, target.id))
                await transaction.delete(userRecord).where(eq(userRecord.userId, target.id))
                await transaction.delete(userDisplayPreference).where(eq(userDisplayPreference.userId, target.id))
                await transaction.delete(userRecordRevision).where(eq(userRecordRevision.userId, target.id))
                await transaction.delete(verification).where(eq(verification.identifier, email))
                await transaction.delete(user).where(eq(user.id, target.id))
            })
            const remaining = await database.select({ id: user.id }).from(user).where(eq(user.email, email))
            console.info(JSON.stringify({ remaining: remaining.length }))
        }
    }
} catch {
    console.error('계정 유지보수 실행 실패: 연결 또는 권한을 확인해야 합니다.')
    process.exitCode = 1
} finally {
    database.$client.close()
}

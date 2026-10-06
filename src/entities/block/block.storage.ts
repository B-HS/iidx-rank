import 'server-only'
import { and, desc, eq } from 'drizzle-orm'
import { userSummaryColumns } from '@entities/profile/user-summary.server'
import { user } from '@shared/server/db/auth-schema'
import { getDb } from '@shared/server/db/get-db'
import { userBlock, userProfile } from '@shared/server/db/profile-schema'

export const readBlockedUserRows = async (blockerId: string) =>
    await getDb()
        .select(userSummaryColumns)
        .from(userBlock)
        .innerJoin(user, eq(user.id, userBlock.blockedId))
        .innerJoin(userProfile, eq(userProfile.userId, userBlock.blockedId))
        .where(eq(userBlock.blockerId, blockerId))
        .orderBy(desc(userBlock.createdAt), desc(userProfile.handle))

export const readUserIdByHandle = async (handle: string) => {
    const rows = await getDb().select({ userId: userProfile.userId }).from(userProfile).where(eq(userProfile.handle, handle)).limit(1)

    return rows[0]?.userId ?? null
}

export const insertBlock = async (blockerId: string, blockedId: string) => {
    await getDb().insert(userBlock).values({ blockerId, blockedId, createdAt: new Date().toISOString() }).onConflictDoNothing()
}

export const deleteBlock = async (blockerId: string, blockedId: string) => {
    await getDb()
        .delete(userBlock)
        .where(and(eq(userBlock.blockerId, blockerId), eq(userBlock.blockedId, blockedId)))
}

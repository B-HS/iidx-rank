import { z } from 'zod'
import { eq, count, inArray, or, sql } from 'drizzle-orm'
import { getDb } from '@shared/server/db/get-db'
import { user, account, session, verification } from '@shared/server/db/auth-schema'
import { boardComment, boardPost } from '@shared/server/db/board-schema'
import { userRecord, userRecordHistory, userRecordRevision } from '@shared/server/db/checker-schema'
import { eamusementImport } from '@shared/server/db/eamusement-schema'
import { uploadedFile } from '@shared/server/db/file-schema'
import { userDisplayPreference } from '@shared/server/db/preferences-schema'
import { userBlock, userFollow, userProfile } from '@shared/server/db/profile-schema'

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
                const commentedPosts = await transaction
                    .select({ postId: boardComment.postId })
                    .from(boardComment)
                    .where(eq(boardComment.authorId, target.id))
                const ownPostIds = transaction.select({ id: boardPost.id }).from(boardPost).where(eq(boardPost.authorId, target.id))
                await transaction.delete(boardComment).where(eq(boardComment.authorId, target.id))
                await transaction.delete(boardComment).where(inArray(boardComment.postId, ownPostIds))
                await transaction.delete(boardPost).where(eq(boardPost.authorId, target.id))
                const remainingCommentedPostIds = [...new Set(commentedPosts.map((comment) => comment.postId))]
                if (remainingCommentedPostIds.length > 0) {
                    await transaction
                        .update(boardPost)
                        .set({ commentCount: sql`(SELECT count(*) FROM ${boardComment} WHERE ${boardComment.postId} = ${boardPost.id})` })
                        .where(inArray(boardPost.id, remainingCommentedPostIds))
                }
                await transaction.delete(uploadedFile).where(eq(uploadedFile.ownerId, target.id))
                await transaction.delete(userFollow).where(or(eq(userFollow.followerId, target.id), eq(userFollow.followeeId, target.id)))
                await transaction.delete(userBlock).where(or(eq(userBlock.blockerId, target.id), eq(userBlock.blockedId, target.id)))
                await transaction.delete(userProfile).where(eq(userProfile.userId, target.id))
                await transaction.delete(session).where(eq(session.userId, target.id))
                await transaction.delete(account).where(eq(account.userId, target.id))
                await transaction.delete(userRecordHistory).where(eq(userRecordHistory.userId, target.id))
                await transaction.delete(eamusementImport).where(eq(eamusementImport.userId, target.id))
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

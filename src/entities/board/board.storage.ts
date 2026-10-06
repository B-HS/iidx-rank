import 'server-only'
import { and, asc, count, desc, eq, gte, notExists, sql } from 'drizzle-orm'
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core'
import { BOARD_COMMENTS_PAGE_SIZE, BOARD_NOTICES_LIMIT, BOARD_POSTS_PAGE_SIZE, BOARD_POST_KIND } from '@entities/board/board.dto'
import { userSummaryColumns } from '@entities/profile/user-summary.server'
import { user } from '@shared/server/db/auth-schema'
import { boardComment, boardPost } from '@shared/server/db/board-schema'
import { getDb } from '@shared/server/db/get-db'
import { userBlock, userProfile } from '@shared/server/db/profile-schema'

const postSummaryColumns = {
    id: boardPost.id,
    authorId: boardPost.authorId,
    kind: boardPost.kind,
    title: boardPost.title,
    commentCount: boardPost.commentCount,
    createdAt: boardPost.createdAt,
    updatedAt: boardPost.updatedAt,
    author: userSummaryColumns,
}

const commentColumns = {
    id: boardComment.id,
    authorId: boardComment.authorId,
    content: boardComment.content,
    createdAt: boardComment.createdAt,
    author: userSummaryColumns,
}

const getPageOffset = (page: number, pageSize: number) => (page - 1) * pageSize

const isNotBlockedBy = (viewerId: string | null, authorId: AnySQLiteColumn) =>
    viewerId === null
        ? undefined
        : notExists(
              getDb()
                  .select({ blockedId: userBlock.blockedId })
                  .from(userBlock)
                  .where(and(eq(userBlock.blockerId, viewerId), eq(userBlock.blockedId, authorId))),
          )

const visibleGeneralPosts = (viewerId: string | null) =>
    and(eq(boardPost.kind, BOARD_POST_KIND.GENERAL), isNotBlockedBy(viewerId, boardPost.authorId))

const visibleComments = (postId: string, viewerId: string | null) =>
    and(eq(boardComment.postId, postId), isNotBlockedBy(viewerId, boardComment.authorId))

const selectPostSummaries = () =>
    getDb()
        .select(postSummaryColumns)
        .from(boardPost)
        .innerJoin(user, eq(user.id, boardPost.authorId))
        .innerJoin(userProfile, eq(userProfile.userId, boardPost.authorId))

const selectComments = () =>
    getDb()
        .select(commentColumns)
        .from(boardComment)
        .innerJoin(user, eq(user.id, boardComment.authorId))
        .innerJoin(userProfile, eq(userProfile.userId, boardComment.authorId))

export const readNoticeRows = async () =>
    await selectPostSummaries()
        .where(eq(boardPost.kind, BOARD_POST_KIND.NOTICE))
        .orderBy(desc(boardPost.createdAt), desc(boardPost.id))
        .limit(BOARD_NOTICES_LIMIT)

export const readGeneralPostRows = async (viewerId: string | null, page: number) =>
    await selectPostSummaries()
        .where(visibleGeneralPosts(viewerId))
        .orderBy(desc(boardPost.createdAt), desc(boardPost.id))
        .limit(BOARD_POSTS_PAGE_SIZE)
        .offset(getPageOffset(page, BOARD_POSTS_PAGE_SIZE))

export const countGeneralPosts = async (viewerId: string | null) => {
    const rows = await getDb()
        .select({ total: count() })
        .from(boardPost)
        .innerJoin(userProfile, eq(userProfile.userId, boardPost.authorId))
        .where(visibleGeneralPosts(viewerId))

    return rows[0]?.total ?? 0
}

export const readPostRow = async (postId: string) => {
    const rows = await getDb()
        .select({ ...postSummaryColumns, content: boardPost.content })
        .from(boardPost)
        .innerJoin(user, eq(user.id, boardPost.authorId))
        .innerJoin(userProfile, eq(userProfile.userId, boardPost.authorId))
        .where(eq(boardPost.id, postId))
        .limit(1)

    return rows[0] ?? null
}

export const readPostAccessRow = async (postId: string) => {
    const rows = await getDb().select({ authorId: boardPost.authorId, kind: boardPost.kind }).from(boardPost).where(eq(boardPost.id, postId)).limit(1)

    return rows[0] ?? null
}

export const insertPost = async (post: typeof boardPost.$inferInsert) => {
    await getDb().insert(boardPost).values(post)
}

export const updatePost = async (postId: string, changes: Pick<typeof boardPost.$inferInsert, 'title' | 'content' | 'updatedAt'>) => {
    await getDb().update(boardPost).set(changes).where(eq(boardPost.id, postId))
}

export const deletePost = async (postId: string) => {
    const rows = await getDb().delete(boardPost).where(eq(boardPost.id, postId)).returning({ id: boardPost.id })

    return rows.length > 0
}

export const countRecentPosts = async (authorId: string, since: string) => {
    const rows = await getDb()
        .select({ total: count() })
        .from(boardPost)
        .where(and(eq(boardPost.authorId, authorId), gte(boardPost.createdAt, since)))

    return rows[0]?.total ?? 0
}

export const readCommentRows = async (postId: string, viewerId: string | null, page: number) =>
    await selectComments()
        .where(visibleComments(postId, viewerId))
        .orderBy(asc(boardComment.createdAt), asc(boardComment.id))
        .limit(BOARD_COMMENTS_PAGE_SIZE)
        .offset(getPageOffset(page, BOARD_COMMENTS_PAGE_SIZE))

export const countComments = async (postId: string, viewerId: string | null) => {
    const rows = await getDb()
        .select({ total: count() })
        .from(boardComment)
        .innerJoin(userProfile, eq(userProfile.userId, boardComment.authorId))
        .where(visibleComments(postId, viewerId))

    return rows[0]?.total ?? 0
}

export const readCommentRow = async (commentId: string) => {
    const rows = await selectComments().where(eq(boardComment.id, commentId)).limit(1)

    return rows[0] ?? null
}

export const insertComment = async (comment: typeof boardComment.$inferInsert) =>
    await getDb().transaction(async (transaction) => {
        const posts = await transaction
            .update(boardPost)
            .set({ commentCount: sql`${boardPost.commentCount} + 1` })
            .where(eq(boardPost.id, comment.postId))
            .returning({ id: boardPost.id })

        if (posts.length === 0) return false

        await transaction.insert(boardComment).values(comment)

        return true
    })

export const deleteComment = async (commentId: string) =>
    await getDb().transaction(async (transaction) => {
        const comments = await transaction.delete(boardComment).where(eq(boardComment.id, commentId)).returning({ postId: boardComment.postId })
        const comment = comments[0]

        if (!comment) return false

        await transaction
            .update(boardPost)
            .set({ commentCount: sql`max(${boardPost.commentCount} - 1, 0)` })
            .where(eq(boardPost.id, comment.postId))

        return true
    })

export const countRecentComments = async (authorId: string, since: string) => {
    const rows = await getDb()
        .select({ total: count() })
        .from(boardComment)
        .where(and(eq(boardComment.authorId, authorId), gte(boardComment.createdAt, since)))

    return rows[0]?.total ?? 0
}

export const readSitemapPostRows = async (limit: number) =>
    await getDb()
        .select({ id: boardPost.id, updatedAt: boardPost.updatedAt })
        .from(boardPost)
        .innerJoin(userProfile, eq(userProfile.userId, boardPost.authorId))
        .orderBy(desc(boardPost.updatedAt), desc(boardPost.id))
        .limit(limit)

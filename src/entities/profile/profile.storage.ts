import 'server-only'
import { and, asc, count, desc, eq, isNotNull, ne } from 'drizzle-orm'
import type { ProfileUpdateInput } from '@entities/profile/profile.dto'
import {
    MyProfileSchema,
    NO_PLAY_LAMP,
    ProfileRecordsSchema,
    ProfileSchema,
    RECENT_USERS_LIMIT,
    RecentUsersSchema,
} from '@entities/profile/profile.dto'
import { toUserSummary, userSummaryColumns } from '@entities/profile/user-summary.server'
import { user } from '@shared/server/db/auth-schema'
import { catalogCharts } from '@shared/server/db/catalog-schema'
import { userRecord, userRecordRevision } from '@shared/server/db/checker-schema'
import { getDb } from '@shared/server/db/get-db'
import { userFollow, userProfile } from '@shared/server/db/profile-schema'

const profileOwnerColumns = { userId: userProfile.userId, bio: userProfile.bio, ...userSummaryColumns }

const readProfileOwner = async (handle: string) => {
    const rows = await getDb()
        .select(profileOwnerColumns)
        .from(userProfile)
        .innerJoin(user, eq(user.id, userProfile.userId))
        .where(eq(userProfile.handle, handle))
        .limit(1)

    return rows[0] ?? null
}

export const readVisibleProfileOwner = async (handle: string, viewerId: string | null) => {
    const owner = await readProfileOwner(handle)

    if (!owner || (!owner.isPublic && owner.userId !== viewerId)) return null

    return owner
}

export const readMyProfile = async (userId: string) => {
    const rows = await getDb()
        .select(profileOwnerColumns)
        .from(userProfile)
        .innerJoin(user, eq(user.id, userProfile.userId))
        .where(eq(userProfile.userId, userId))
        .limit(1)
    const row = rows[0]

    if (!row) return null

    const { bio, userId: ownerId, ...summary } = row

    return MyProfileSchema.parse({ ...toUserSummary(summary), userId: ownerId, bio, avatarKey: summary.avatarKey })
}

export const readProfile = async (handle: string, viewerId: string | null) => {
    const owner = await readVisibleProfileOwner(handle, viewerId)

    if (!owner) return null

    const { bio, userId: ownerId, ...summary } = owner
    const database = getDb()
    const isOwner = ownerId === viewerId
    const [followers, following, played, viewerFollows] = await Promise.all([
        database.select({ total: count() }).from(userFollow).where(eq(userFollow.followeeId, ownerId)),
        database.select({ total: count() }).from(userFollow).where(eq(userFollow.followerId, ownerId)),
        database
            .select({ total: count() })
            .from(userRecord)
            .innerJoin(catalogCharts, eq(catalogCharts.id, userRecord.chartId))
            .where(and(eq(userRecord.userId, ownerId), eq(catalogCharts.isActive, true), ne(userRecord.lamp, NO_PLAY_LAMP))),
        viewerId === null || isOwner
            ? []
            : database
                  .select({ followerId: userFollow.followerId })
                  .from(userFollow)
                  .where(and(eq(userFollow.followerId, viewerId), eq(userFollow.followeeId, ownerId)))
                  .limit(1),
    ])

    return ProfileSchema.parse({
        ...toUserSummary(summary),
        bio,
        followerCount: followers[0]?.total ?? 0,
        followingCount: following[0]?.total ?? 0,
        playedCount: played[0]?.total ?? 0,
        isOwner,
        isFollowing: viewerFollows.length > 0,
    })
}

export const readProfileRecords = async (handle: string, viewerId: string | null) => {
    const owner = await readVisibleProfileOwner(handle, viewerId)

    if (!owner) return null

    const records = await getDb()
        .select({
            chartId: userRecord.chartId,
            title: catalogCharts.title,
            difficulty: catalogCharts.difficulty,
            version: catalogCharts.version,
            lamp: userRecord.lamp,
            scoreGrade: userRecord.scoreGrade,
            updatedAt: userRecord.updatedAt,
        })
        .from(userRecord)
        .innerJoin(catalogCharts, eq(catalogCharts.id, userRecord.chartId))
        .where(and(eq(userRecord.userId, owner.userId), eq(catalogCharts.isActive, true)))
        .orderBy(desc(userRecord.updatedAt), asc(userRecord.chartId))

    return ProfileRecordsSchema.parse({ records })
}

const isHandleTakenByAnotherUser = async (userId: string, handle: string) => {
    const rows = await getDb()
        .select({ userId: userProfile.userId })
        .from(userProfile)
        .where(and(eq(userProfile.handle, handle), ne(userProfile.userId, userId)))
        .limit(1)

    return rows.length > 0
}

export const writeMyProfile = async (userId: string, input: ProfileUpdateInput) => {
    const updatedAt = new Date()

    try {
        return await getDb().transaction(async (transaction) => {
            const currentProfiles = await transaction
                .select({ avatarKey: userProfile.avatarKey })
                .from(userProfile)
                .where(eq(userProfile.userId, userId))
                .limit(1)
            const currentProfile = currentProfiles[0]

            if (!currentProfile) return { status: 'PROFILE_MISSING' as const }

            const conflictingProfiles = await transaction
                .select({ userId: userProfile.userId })
                .from(userProfile)
                .where(and(eq(userProfile.handle, input.handle), ne(userProfile.userId, userId)))
                .limit(1)

            if (conflictingProfiles.length > 0) return { status: 'HANDLE_TAKEN' as const }

            await transaction
                .update(userProfile)
                .set({
                    handle: input.handle,
                    bio: input.bio,
                    avatarKey: input.avatarKey,
                    isPublic: input.isPublic,
                    updatedAt: updatedAt.toISOString(),
                })
                .where(eq(userProfile.userId, userId))
            await transaction.update(user).set({ name: input.name, updatedAt }).where(eq(user.id, userId))

            return { status: 'UPDATED' as const, previousAvatarKey: currentProfile.avatarKey }
        })
    } catch (error) {
        if (await isHandleTakenByAnotherUser(userId, input.handle)) return { status: 'HANDLE_TAKEN' as const }

        throw error
    }
}

export const insertFollow = async (followerId: string, followeeId: string) => {
    await getDb().insert(userFollow).values({ followerId, followeeId, createdAt: new Date().toISOString() }).onConflictDoNothing()
}

export const deleteFollow = async (followerId: string, followeeId: string) => {
    await getDb()
        .delete(userFollow)
        .where(and(eq(userFollow.followerId, followerId), eq(userFollow.followeeId, followeeId)))
}

export const readRecentUsers = async () => {
    const rows = await getDb()
        .select({ ...userSummaryColumns, updatedAt: userRecordRevision.updatedAt })
        .from(userRecordRevision)
        .innerJoin(userProfile, eq(userProfile.userId, userRecordRevision.userId))
        .innerJoin(user, eq(user.id, userProfile.userId))
        .where(and(eq(userProfile.isPublic, true), isNotNull(userRecordRevision.updatedAt)))
        .orderBy(desc(userRecordRevision.updatedAt), asc(userProfile.handle))
        .limit(RECENT_USERS_LIMIT)

    return RecentUsersSchema.parse({ users: rows.map(({ updatedAt, ...summary }) => ({ ...toUserSummary(summary), updatedAt })) })
}

export const readSitemapProfileRows = async (limit: number) =>
    await getDb()
        .select({ handle: userProfile.handle, updatedAt: userProfile.updatedAt, recordsUpdatedAt: userRecordRevision.updatedAt })
        .from(userProfile)
        .leftJoin(userRecordRevision, eq(userRecordRevision.userId, userProfile.userId))
        .where(eq(userProfile.isPublic, true))
        .orderBy(desc(userProfile.updatedAt), asc(userProfile.handle))
        .limit(limit)

import { z } from 'zod'
import { ChartSchema } from '@entities/catalog/catalog.dto'
import { RecordSchema } from '@entities/checker/checker.dto'
import { FileKeySchema } from '@entities/file/file.dto'
import { HandleSchema, UserSummarySchema } from '@entities/profile/user-summary.dto'

export const PROFILE_NAME_MIN_LENGTH = 1
export const PROFILE_NAME_MAX_LENGTH = 40
export const PROFILE_BIO_MAX_LENGTH = 300
export const RECENT_USERS_LIMIT = 10

export const ProfileNameSchema = z.string().trim().min(PROFILE_NAME_MIN_LENGTH).max(PROFILE_NAME_MAX_LENGTH)
export const ProfileBioSchema = z.string().trim().max(PROFILE_BIO_MAX_LENGTH)

export const MyProfileSchema = z.object({
    userId: z.uuid(),
    handle: HandleSchema,
    name: z.string(),
    bio: z.string(),
    avatarKey: FileKeySchema.nullable(),
    avatarUrl: UserSummarySchema.shape.avatarUrl,
    isPublic: z.boolean(),
})
export type MyProfile = z.infer<typeof MyProfileSchema>

export const ProfileUpdateInputSchema = z.strictObject({
    name: ProfileNameSchema,
    handle: HandleSchema,
    bio: ProfileBioSchema,
    isPublic: z.boolean(),
    avatarKey: FileKeySchema.nullable(),
})
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateInputSchema>

export const ProfileSchema = UserSummarySchema.extend({
    bio: z.string(),
    followerCount: z.number().int().nonnegative(),
    followingCount: z.number().int().nonnegative(),
    playedCount: z.number().int().nonnegative(),
    isOwner: z.boolean(),
    isFollowing: z.boolean(),
})
export type Profile = z.infer<typeof ProfileSchema>

export const ProfileRecordSchema = z.object({
    chartId: ChartSchema.shape.id,
    title: ChartSchema.shape.title,
    difficulty: ChartSchema.shape.difficulty,
    version: ChartSchema.shape.version,
    lamp: RecordSchema.shape.lamp,
    scoreGrade: RecordSchema.shape.scoreGrade.removeDefault(),
    updatedAt: RecordSchema.shape.updatedAt,
})
export type ProfileRecord = z.infer<typeof ProfileRecordSchema>

export const NO_PLAY_LAMP = 'NO_PLAY' satisfies ProfileRecord['lamp']

export const ProfileRecordsSchema = z.object({ records: z.array(ProfileRecordSchema) })
export type ProfileRecords = z.infer<typeof ProfileRecordsSchema>

export const RecentUserSchema = UserSummarySchema.omit({ isPublic: true }).extend({ updatedAt: z.iso.datetime() })
export type RecentUser = z.infer<typeof RecentUserSchema>

export const RecentUsersSchema = z.object({ users: z.array(RecentUserSchema).max(RECENT_USERS_LIMIT) })
export type RecentUsers = z.infer<typeof RecentUsersSchema>

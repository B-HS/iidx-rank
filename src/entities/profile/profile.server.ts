import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { deleteUploadedFile, isOwnedFile } from '@entities/file/file.server'
import type { ProfileUpdateInput } from '@entities/profile/profile.dto'
import {
    MyProfileSchema,
    ProfileUpdateInputSchema,
    USER_LIST_PAGE_SIZE,
    UserListPageQuerySchema,
    UserListSchema,
} from '@entities/profile/profile.dto'
import {
    countListedUsers,
    deleteFollow,
    insertFollow,
    readListedUsers,
    readMyProfile,
    readProfile,
    readProfileRecords,
    readSitemapProfileRows,
    readVisibleProfileOwner,
    writeMyProfile,
} from '@entities/profile/profile.storage'
import { HANDLE_PATTERN, HandleSchema } from '@entities/profile/user-summary.dto'
import { createDefaultHandle, ensureUserProfile } from '@entities/profile/user-summary.server'
import { createPagination } from '@shared/lib/pagination'
import { RECENT_USERS_TAG } from '@shared/server/cache-tags'
import { SITEMAP_CACHE_LIFE, SITEMAP_ENTITY_LIMIT } from '@shared/server/sitemap-cache'

const RECENT_USERS_CACHE_STALE_SECONDS = 60
const RECENT_USERS_CACHE_REVALIDATE_SECONDS = 60
const RECENT_USERS_CACHE_EXPIRE_SECONDS = 300

const ensureOwnDefaultProfile = async (handle: string, viewerId: string | null) => {
    if (viewerId !== null && handle === createDefaultHandle(viewerId)) await ensureUserProfile(viewerId)
}

const deletePreviousAvatar = async (userId: string, avatarKey: string) => {
    try {
        await deleteUploadedFile(userId, avatarKey)
    } catch {
        return
    }
}

export const getMyProfile = async (userId: string) => {
    const validatedUserId = MyProfileSchema.shape.userId.parse(userId)

    await ensureUserProfile(validatedUserId)

    return await readMyProfile(validatedUserId)
}

export const updateMyProfile = async (userId: string, input: ProfileUpdateInput) => {
    const validatedUserId = MyProfileSchema.shape.userId.parse(userId)
    const validatedInput = ProfileUpdateInputSchema.parse(input)

    await ensureUserProfile(validatedUserId)

    if (validatedInput.avatarKey !== null && !(await isOwnedFile(validatedUserId, validatedInput.avatarKey, 'avatar'))) {
        return { status: 'AVATAR_NOT_OWNED' as const }
    }

    const result = await writeMyProfile(validatedUserId, validatedInput)

    if (result.status !== 'UPDATED') return { status: result.status }

    if (result.previousAvatarKey !== null && result.previousAvatarKey !== validatedInput.avatarKey) {
        await deletePreviousAvatar(validatedUserId, result.previousAvatarKey)
    }

    const profile = await readMyProfile(validatedUserId)

    if (!profile) return { status: 'PROFILE_MISSING' as const }

    return { status: 'UPDATED' as const, profile }
}

export const getProfile = async (handle: string, viewerId: string | null) => {
    const validatedHandle = HandleSchema.parse(handle)

    await ensureOwnDefaultProfile(validatedHandle, viewerId)

    return await readProfile(validatedHandle, viewerId)
}

export const getProfileRecords = async (handle: string, viewerId: string | null) => {
    const validatedHandle = HandleSchema.parse(handle)

    await ensureOwnDefaultProfile(validatedHandle, viewerId)

    return await readProfileRecords(validatedHandle, viewerId)
}

export const setProfileFollow = async (viewerId: string, handle: string, shouldFollow: boolean) => {
    const validatedHandle = HandleSchema.parse(handle)
    const target = await readVisibleProfileOwner(validatedHandle, viewerId)

    if (!target) return { status: 'NOT_FOUND' as const }
    if (target.userId === viewerId) return { status: 'SELF' as const }

    await (shouldFollow ? insertFollow : deleteFollow)(viewerId, target.userId)

    const profile = await readProfile(validatedHandle, viewerId)

    if (!profile) return { status: 'NOT_FOUND' as const }

    return { status: 'UPDATED' as const, profile }
}

export const getUserList = async (page: number) => {
    'use cache'

    cacheLife({
        stale: RECENT_USERS_CACHE_STALE_SECONDS,
        revalidate: RECENT_USERS_CACHE_REVALIDATE_SECONDS,
        expire: RECENT_USERS_CACHE_EXPIRE_SECONDS,
    })
    cacheTag(RECENT_USERS_TAG)

    const validatedPage = UserListPageQuerySchema.shape.page.parse(page)
    const [users, total] = await Promise.all([readListedUsers(validatedPage), countListedUsers()])

    return UserListSchema.parse({ users, pagination: createPagination(validatedPage, USER_LIST_PAGE_SIZE, total) })
}

export const getSitemapProfiles = async () => {
    'use cache'

    cacheLife(SITEMAP_CACHE_LIFE)

    const rows = await readSitemapProfileRows(SITEMAP_ENTITY_LIMIT)

    return rows
        .filter((row) => HANDLE_PATTERN.test(row.handle))
        .map(({ handle, updatedAt, recordsUpdatedAt }) => ({
            handle,
            updatedAt: recordsUpdatedAt !== null && Date.parse(recordsUpdatedAt) > Date.parse(updatedAt) ? recordsUpdatedAt : updatedAt,
        }))
}

import 'server-only'
import { getFileUrl } from '@entities/file/file.dto'
import { user } from '@shared/server/db/auth-schema'
import { getDb } from '@shared/server/db/get-db'
import { userProfile } from '@shared/server/db/profile-schema'

const DEFAULT_HANDLE_PREFIX = 'user_'
const DEFAULT_HANDLE_ID_LENGTH = 12

export const userSummaryColumns = {
    handle: userProfile.handle,
    name: user.name,
    avatarKey: userProfile.avatarKey,
    isPublic: userProfile.isPublic,
}

type UserSummaryRow = { handle: string; name: string; avatarKey: string | null; isPublic: boolean }

export const toUserSummary = ({ avatarKey, ...row }: UserSummaryRow) => ({ ...row, avatarUrl: avatarKey ? getFileUrl(avatarKey) : null })

export const createDefaultHandle = (userId: string) =>
    DEFAULT_HANDLE_PREFIX + userId.replaceAll('-', '').slice(0, DEFAULT_HANDLE_ID_LENGTH).toLowerCase()

export const ensureUserProfile = async (userId: string) => {
    const timestamp = new Date().toISOString()
    await getDb()
        .insert(userProfile)
        .values({ userId, handle: createDefaultHandle(userId), createdAt: timestamp, updatedAt: timestamp })
        .onConflictDoNothing({ target: userProfile.userId })
}

import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { DisplayPreferencesSchema, DisplayPreferencesInputSchema } from '@entities/preferences/preferences.dto'
import { getPreferencesRevision, readDisplayPreferences, writeDisplayPreferences } from '@entities/preferences/preferences.storage'
import { PREFERENCES_CACHE_STALE_SECONDS, PREFERENCES_CACHE_REVALIDATE_SECONDS, PREFERENCES_CACHE_EXPIRE_SECONDS } from '@shared/constants/display'
import { userPreferencesTag } from '@shared/server/cache-tags'

const getPreferencesByRevision = async (userId: string, _revision: number) => {
    'use cache'
    cacheLife({ stale: PREFERENCES_CACHE_STALE_SECONDS, revalidate: PREFERENCES_CACHE_REVALIDATE_SECONDS, expire: PREFERENCES_CACHE_EXPIRE_SECONDS })
    cacheTag(userPreferencesTag(userId))
    return await readDisplayPreferences(userId)
}
export const getDisplayPreferences = async (userId: string) => {
    const validatedUserId = DisplayPreferencesSchema.shape.userId.parse(userId)
    return await getPreferencesByRevision(validatedUserId, await getPreferencesRevision(validatedUserId))
}
export const saveDisplayPreferences = async (userId: string, input: DisplayPreferencesInput) =>
    await writeDisplayPreferences(DisplayPreferencesSchema.shape.userId.parse(userId), DisplayPreferencesInputSchema.parse(input))

import 'server-only'
import { eq, sql } from 'drizzle-orm'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { DisplayPreferencesSchema } from '@entities/preferences/preferences.dto'
import { DEFAULT_DISPLAY_PREFERENCES } from '@shared/constants/display'
import { getDb } from '@shared/server/db/get-db'
import { userDisplayPreference } from '@shared/server/db/preferences-schema'

export const getPreferencesRevision = async (userId: string) => {
    const rows = await getDb()
        .select({ revision: userDisplayPreference.revision })
        .from(userDisplayPreference)
        .where(eq(userDisplayPreference.userId, userId))
        .limit(1)
    return rows[0]?.revision ?? 0
}
export const readDisplayPreferences = async (userId: string) => {
    const rows = await getDb()
        .select({ versionDisplay: userDisplayPreference.versionDisplay, logoOpacity: userDisplayPreference.logoOpacity })
        .from(userDisplayPreference)
        .where(eq(userDisplayPreference.userId, userId))
        .limit(1)
    return DisplayPreferencesSchema.parse({ userId, preferences: rows[0] ?? DEFAULT_DISPLAY_PREFERENCES })
}
export const writeDisplayPreferences = async (userId: string, input: DisplayPreferencesInput) => {
    const updatedAt = new Date().toISOString()
    const rows = await getDb()
        .insert(userDisplayPreference)
        .values({ userId, ...input, revision: 1, updatedAt })
        .onConflictDoUpdate({
            target: userDisplayPreference.userId,
            set: { ...input, updatedAt, revision: sql`${userDisplayPreference.revision} + 1` },
        })
        .returning({ versionDisplay: userDisplayPreference.versionDisplay, logoOpacity: userDisplayPreference.logoOpacity })
    return DisplayPreferencesSchema.parse({ userId, preferences: rows[0] })
}

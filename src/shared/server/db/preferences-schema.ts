import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { DEFAULT_LOGO_OPACITY, VERSION_DISPLAYS } from '@shared/constants/display'
import { user } from '@shared/server/db/auth-schema'

export const userDisplayPreference = sqliteTable('user_display_preference', {
    userId: text('user_id')
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    versionDisplay: text('version_display', { enum: VERSION_DISPLAYS }).notNull().default(VERSION_DISPLAYS[0]),
    logoOpacity: integer('logo_opacity').notNull().default(DEFAULT_LOGO_OPACITY),
    revision: integer('revision').notNull().default(0),
    updatedAt: text('updated_at').notNull(),
})

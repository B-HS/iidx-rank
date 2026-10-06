import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from '@shared/server/db/auth-schema'

export const userProfile = sqliteTable('user_profile', {
    userId: text('user_id')
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    handle: text('handle').notNull().unique(),
    bio: text('bio').notNull().default(''),
    avatarKey: text('avatar_key'),
    isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
})

export const userFollow = sqliteTable(
    'user_follow',
    {
        followerId: text('follower_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        followeeId: text('followee_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        createdAt: text('created_at').notNull(),
    },
    (table) => [primaryKey({ columns: [table.followerId, table.followeeId] }), index('user_follow_followee_id_idx').on(table.followeeId)],
)

export const userBlock = sqliteTable(
    'user_block',
    {
        blockerId: text('blocker_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        blockedId: text('blocked_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        createdAt: text('created_at').notNull(),
    },
    (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] })],
)

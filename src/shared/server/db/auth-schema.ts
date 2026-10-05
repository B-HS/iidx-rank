import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

const timestampMs = (columnName: string) => integer(columnName, { mode: 'timestamp_ms' })

export const user = sqliteTable('user', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
    image: text('image'),
    createdAt: timestampMs('created_at').notNull(),
    updatedAt: timestampMs('updated_at').notNull(),
})

export const session = sqliteTable(
    'session',
    {
        id: text('id').primaryKey(),
        expiresAt: timestampMs('expires_at').notNull(),
        token: text('token').notNull().unique(),
        createdAt: timestampMs('created_at').notNull(),
        updatedAt: timestampMs('updated_at').notNull(),
        ipAddress: text('ip_address'),
        userAgent: text('user_agent'),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
    },
    (table) => [index('session_user_id_idx').on(table.userId)],
)

export const account = sqliteTable(
    'account',
    {
        id: text('id').primaryKey(),
        accountId: text('account_id').notNull(),
        providerId: text('provider_id').notNull(),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        accessToken: text('access_token'),
        refreshToken: text('refresh_token'),
        idToken: text('id_token'),
        accessTokenExpiresAt: timestampMs('access_token_expires_at'),
        refreshTokenExpiresAt: timestampMs('refresh_token_expires_at'),
        scope: text('scope'),
        password: text('password'),
        createdAt: timestampMs('created_at').notNull(),
        updatedAt: timestampMs('updated_at').notNull(),
    },
    (table) => [index('account_user_id_idx').on(table.userId)],
)

export const verification = sqliteTable(
    'verification',
    {
        id: text('id').primaryKey(),
        identifier: text('identifier').notNull(),
        value: text('value').notNull(),
        expiresAt: timestampMs('expires_at').notNull(),
        createdAt: timestampMs('created_at'),
        updatedAt: timestampMs('updated_at'),
    },
    (table) => [index('verification_identifier_idx').on(table.identifier)],
)

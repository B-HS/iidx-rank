import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from '@shared/server/db/auth-schema'

export const userRecord = sqliteTable(
    'user_record',
    {
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        chartId: text('chart_id').notNull(),
        lamp: text('lamp').notNull(),
        memo: text('memo').notNull().default(''),
        updatedAt: text('updated_at').notNull(),
    },
    (table) => [primaryKey({ columns: [table.userId, table.chartId] })],
)

export const userRecordRevision = sqliteTable('user_record_revision', {
    userId: text('user_id')
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull().default(0),
})

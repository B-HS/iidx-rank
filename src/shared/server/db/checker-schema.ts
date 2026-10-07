import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from '@shared/server/db/auth-schema'
import { eamusementImport } from '@shared/server/db/eamusement-schema'

export const userRecord = sqliteTable(
    'user_record',
    {
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        chartId: text('chart_id').notNull(),
        lamp: text('lamp').notNull(),
        scoreGrade: text('score_grade'),
        memo: text('memo').notNull().default(''),
        updatedAt: text('updated_at').notNull(),
        exScore: integer('ex_score'),
        missCount: integer('miss_count'),
        source: text('source').notNull().default('manual'),
    },
    (table) => [primaryKey({ columns: [table.userId, table.chartId] })],
)

export const userRecordHistory = sqliteTable(
    'user_record_history',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        chartId: text('chart_id').notNull(),
        lamp: text('lamp').notNull(),
        scoreGrade: text('score_grade'),
        exScore: integer('ex_score'),
        missCount: integer('miss_count'),
        source: text('source').notNull(),
        importId: integer('import_id').references(() => eamusementImport.id, { onDelete: 'set null' }),
        recordedAt: text('recorded_at').notNull(),
    },
    (table) => [index('user_record_history_user_id_chart_id_id_idx').on(table.userId, table.chartId, table.id)],
)

export const userRecordRevision = sqliteTable('user_record_revision', {
    userId: text('user_id')
        .primaryKey()
        .references(() => user.id, { onDelete: 'cascade' }),
    revision: integer('revision').notNull().default(0),
    updatedAt: text('updated_at'),
})

export type UserRecordRow = typeof userRecord.$inferSelect

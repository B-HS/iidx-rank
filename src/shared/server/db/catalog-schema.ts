import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const catalogCharts = sqliteTable('catalog_charts', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    difficulty: text('difficulty').notNull(),
    version: text('version').notNull(),
    normalRank: text('normal_rank'),
    hardRank: text('hard_rank'),
    normalPersonal: integer('normal_personal', { mode: 'boolean' }).notNull(),
    hardPersonal: integer('hard_personal', { mode: 'boolean' }).notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
})

export const catalogSource = sqliteTable('catalog_source', {
    id: text('id').primaryKey(),
    updatedAt: text('updated_at'),
    fetchedAt: text('fetched_at'),
    chartCount: integer('chart_count').notNull().default(0),
    url: text('url').notNull(),
    revision: integer('revision').notNull().default(0),
    lastAttemptAt: text('last_attempt_at'),
})

export type CatalogChartRow = typeof catalogCharts.$inferSelect
export type NewCatalogChartRow = typeof catalogCharts.$inferInsert
export type CatalogSourceRow = typeof catalogSource.$inferSelect

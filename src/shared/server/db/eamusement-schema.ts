import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from '@shared/server/db/auth-schema'

export const eamusementImport = sqliteTable(
    'eamusement_import',
    {
        id: integer('id').primaryKey({ autoIncrement: true }),
        userId: text('user_id')
            .notNull()
            .references(() => user.id, { onDelete: 'cascade' }),
        channel: text('channel').notNull(),
        gameVersion: integer('game_version').notNull(),
        style: integer('style').notNull(),
        generatedAt: text('generated_at').notNull(),
        djName: text('dj_name'),
        iidxId: text('iidx_id'),
        danRank: text('dan_rank'),
        djPoint: real('dj_point'),
        playCountSp: integer('play_count_sp'),
        playCountDp: integer('play_count_dp'),
        radarNotes: real('radar_notes'),
        radarChord: real('radar_chord'),
        radarPeak: real('radar_peak'),
        radarCharge: real('radar_charge'),
        radarScratch: real('radar_scratch'),
        radarSoflan: real('radar_soflan'),
        receivedCount: integer('received_count').notNull(),
        matchedCount: integer('matched_count').notNull(),
        changedCount: integer('changed_count').notNull(),
        createdAt: text('created_at').notNull(),
    },
    (table) => [index('eamusement_import_user_id_id_idx').on(table.userId, table.id)],
)

export type EamusementImportRow = typeof eamusementImport.$inferSelect

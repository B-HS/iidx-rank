import 'server-only'
import { and, desc, eq, getTableColumns, isNotNull, sql } from 'drizzle-orm'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import { incrementRecordRevision } from '@entities/checker/checker.server'
import type { ImportChannel, ImportInput } from '@entities/eamusement/eamusement.dto'
import { planImport } from '@entities/eamusement/eamusement-merge'
import { IMPORT_COOLDOWN_MS } from '@shared/constants/eamusement'
import { catalogCharts } from '@shared/server/db/catalog-schema'
import { userRecord, userRecordHistory } from '@shared/server/db/checker-schema'
import type { EamusementImportRow } from '@shared/server/db/eamusement-schema'
import { eamusementImport } from '@shared/server/db/eamusement-schema'
import { getDb } from '@shared/server/db/get-db'

const SQLITE_BIND_PARAMETER_LIMIT = 999
const RECORD_WRITE_BATCH_SIZE = Math.floor(SQLITE_BIND_PARAMETER_LIMIT / Object.keys(getTableColumns(userRecord)).length)
const HISTORY_WRITE_BATCH_SIZE = Math.floor(SQLITE_BIND_PARAMETER_LIMIT / Object.keys(getTableColumns(userRecordHistory)).length)
const IMPORT_RECORD_SOURCE = 'eamusement' satisfies ChartRecord['source']

type NotesRadarRow = Pick<EamusementImportRow, 'radarNotes' | 'radarChord' | 'radarPeak' | 'radarCharge' | 'radarScratch' | 'radarSoflan'>

const toBatches = <Row>(rows: Row[], batchSize: number) =>
    Array.from({ length: Math.ceil(rows.length / batchSize) }, (_, index) => rows.slice(index * batchSize, (index + 1) * batchSize))

export const toNotesRadar = (row: NotesRadarRow) => {
    const notesRadar = {
        NOTES: row.radarNotes,
        CHORD: row.radarChord,
        PEAK: row.radarPeak,
        CHARGE: row.radarCharge,
        SCRATCH: row.radarScratch,
        'SOF-LAN': row.radarSoflan,
    }

    return Object.values(notesRadar).every((value) => value === null) ? null : notesRadar
}

export const readLatestImport = async (userId: string) => {
    const rows = await getDb().select().from(eamusementImport).where(eq(eamusementImport.userId, userId)).orderBy(desc(eamusementImport.id)).limit(1)

    return rows[0] ?? null
}

export const readLatestPlayerImport = async (userId: string) => {
    const rows = await getDb()
        .select()
        .from(eamusementImport)
        .where(and(eq(eamusementImport.userId, userId), isNotNull(eamusementImport.djName)))
        .orderBy(desc(eamusementImport.id))
        .limit(1)

    return rows[0] ?? null
}

export const writeImport = async (userId: string, channel: ImportChannel, input: ImportInput) => {
    const importedAt = new Date()
    const createdAt = importedAt.toISOString()
    const cooldownAfter = new Date(importedAt.getTime() - IMPORT_COOLDOWN_MS).toISOString()
    const generatedAt = new Date(input.generatedAt).toISOString()
    const observedAt = generatedAt < createdAt ? generatedAt : createdAt

    return await getDb().transaction(async (transaction) => {
        const latestImports = await transaction
            .select({ createdAt: eamusementImport.createdAt })
            .from(eamusementImport)
            .where(eq(eamusementImport.userId, userId))
            .orderBy(desc(eamusementImport.id))
            .limit(1)

        if (latestImports[0] && latestImports[0].createdAt > cooldownAfter) return { status: 'COOLDOWN' as const }

        const activeCharts = await transaction.select({ id: catalogCharts.id }).from(catalogCharts).where(eq(catalogCharts.isActive, true))
        const currentRecords = await transaction
            .select({
                chartId: userRecord.chartId,
                lamp: userRecord.lamp,
                scoreGrade: userRecord.scoreGrade,
                exScore: userRecord.exScore,
                missCount: userRecord.missCount,
                updatedAt: userRecord.updatedAt,
            })
            .from(userRecord)
            .where(eq(userRecord.userId, userId))
        const { changes, unmatched, ...counts } = planImport(currentRecords, new Set(activeCharts.map((chart) => chart.id)), input.charts, observedAt)
        const [savedImport] = await transaction
            .insert(eamusementImport)
            .values({
                userId,
                channel,
                gameVersion: input.gameVersion,
                style: input.style,
                generatedAt,
                djName: input.player?.djName,
                iidxId: input.player?.iidxId,
                danRank: input.player?.danRank,
                djPoint: input.player?.djPoint,
                playCountSp: input.player?.playCountSp,
                playCountDp: input.player?.playCountDp,
                radarNotes: input.notesRadar?.NOTES,
                radarChord: input.notesRadar?.CHORD,
                radarPeak: input.notesRadar?.PEAK,
                radarCharge: input.notesRadar?.CHARGE,
                radarScratch: input.notesRadar?.SCRATCH,
                radarSoflan: input.notesRadar?.['SOF-LAN'],
                ...counts,
                createdAt,
            })
            .returning({ id: eamusementImport.id })
        const importedRecords = changes.map((change) => ({ userId, ...change, source: IMPORT_RECORD_SOURCE }))

        for (const batch of toBatches(importedRecords, RECORD_WRITE_BATCH_SIZE)) {
            await transaction
                .insert(userRecord)
                .values(batch.map((record) => ({ ...record, updatedAt: observedAt })))
                .onConflictDoUpdate({
                    target: [userRecord.userId, userRecord.chartId],
                    set: {
                        lamp: sql`excluded.lamp`,
                        scoreGrade: sql`excluded.score_grade`,
                        exScore: sql`excluded.ex_score`,
                        missCount: sql`excluded.miss_count`,
                        source: sql`excluded.source`,
                        updatedAt: sql`excluded.updated_at`,
                    },
                })
        }

        for (const batch of toBatches(importedRecords, HISTORY_WRITE_BATCH_SIZE)) {
            await transaction
                .insert(userRecordHistory)
                .values(batch.map((record) => ({ ...record, importId: savedImport.id, recordedAt: createdAt })))
        }

        if (changes.length > 0) await incrementRecordRevision(transaction, userId, createdAt)

        return { status: 'IMPORTED' as const, result: { importId: savedImport.id, channel, importedAt: createdAt, ...counts, unmatched } }
    })
}

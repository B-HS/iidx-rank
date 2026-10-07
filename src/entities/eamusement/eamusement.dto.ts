import { z } from 'zod'
import { ChartSchema } from '@entities/catalog/catalog.dto'
import { RecordSchema } from '@entities/checker/checker.dto'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import {
    IMPORT_CHANGES_LIMIT,
    IMPORT_KIND,
    IMPORT_MAX_CHARTS,
    IMPORT_MAX_LEVEL,
    IMPORT_MIN_LEVEL,
    IMPORT_PLAYER_TEXT_MAX_LENGTH,
    IMPORT_STYLE,
    IMPORT_TITLE_MAX_LENGTH,
    IMPORT_UNMATCHED_LIMIT,
    IMPORT_VERSION,
} from '@shared/constants/eamusement'

export const IMPORT_DIFFICULTIES = ['B', 'N', 'H', 'A', 'L'] as const
export const IMPORT_CHANNELS = ['extension', 'file'] as const
export const NOTES_RADAR_AXES = ['NOTES', 'CHORD', 'PEAK', 'CHARGE', 'SCRATCH', 'SOF-LAN'] as const

const PlayerTextSchema = z.string().max(IMPORT_PLAYER_TEXT_MAX_LENGTH).nullable()
const CountSchema = z.number().int().nonnegative()
const NotesRadarAxisSchema = z.number().nonnegative().nullable()

export const ImportChannelSchema = z.enum(IMPORT_CHANNELS)
export type ImportChannel = z.infer<typeof ImportChannelSchema>

export const EXTENSION_IMPORT_CHANNEL = 'extension' satisfies ImportChannel

export const ImportPlayerSchema = z.strictObject({
    djName: PlayerTextSchema,
    iidxId: PlayerTextSchema,
    danRank: PlayerTextSchema,
    djPoint: z.number().nonnegative().nullable(),
    playCountSp: CountSchema.nullable(),
    playCountDp: CountSchema.nullable(),
})
export type ImportPlayer = z.infer<typeof ImportPlayerSchema>

export const NotesRadarSchema = z.strictObject({
    NOTES: NotesRadarAxisSchema,
    CHORD: NotesRadarAxisSchema,
    PEAK: NotesRadarAxisSchema,
    CHARGE: NotesRadarAxisSchema,
    SCRATCH: NotesRadarAxisSchema,
    'SOF-LAN': NotesRadarAxisSchema,
})
export type NotesRadar = z.infer<typeof NotesRadarSchema>

export const ImportChartSchema = z.strictObject({
    chartId: ChartSchema.shape.id,
    title: z.string().min(1).max(IMPORT_TITLE_MAX_LENGTH),
    difficulty: z.enum(IMPORT_DIFFICULTIES),
    level: z.number().int().min(IMPORT_MIN_LEVEL).max(IMPORT_MAX_LEVEL),
    lamp: RecordSchema.shape.lamp,
    scoreGrade: RecordSchema.shape.scoreGrade.removeDefault(),
    exScore: CountSchema.nullable(),
    missCount: CountSchema.nullable(),
})
export type ImportChart = z.infer<typeof ImportChartSchema>

export const ImportInputSchema = z.strictObject({
    version: z.literal(IMPORT_VERSION),
    kind: z.literal(IMPORT_KIND),
    generatedAt: z.iso.datetime(),
    gameVersion: z.number().int().positive(),
    style: z.literal([IMPORT_STYLE.SP, IMPORT_STYLE.DP]),
    player: ImportPlayerSchema.nullable(),
    notesRadar: NotesRadarSchema.nullable(),
    charts: z.array(ImportChartSchema).max(IMPORT_MAX_CHARTS),
})
export type ImportInput = z.infer<typeof ImportInputSchema>

export const ImportUnmatchedChartSchema = ImportChartSchema.pick({ title: true, difficulty: true })
export type ImportUnmatchedChart = z.infer<typeof ImportUnmatchedChartSchema>

export const ImportChangeSchema = z.object({
    chartId: ImportChartSchema.shape.chartId,
    previousLamp: ImportChartSchema.shape.lamp.nullable(),
    lamp: ImportChartSchema.shape.lamp,
    scoreGrade: ImportChartSchema.shape.scoreGrade,
    exScore: ImportChartSchema.shape.exScore,
})
export type ImportChange = z.infer<typeof ImportChangeSchema>

const ImportCountsSchema = z.object({
    receivedCount: CountSchema,
    matchedCount: CountSchema,
    changedCount: CountSchema,
})

export const ImportResultSchema = ImportCountsSchema.extend({
    importId: z.number().int().positive(),
    channel: ImportChannelSchema,
    importedAt: z.iso.datetime(),
    changes: z.array(ImportChangeSchema).max(IMPORT_CHANGES_LIMIT),
    unmatched: z.array(ImportUnmatchedChartSchema).max(IMPORT_UNMATCHED_LIMIT),
})
export type ImportResult = z.infer<typeof ImportResultSchema>

export const ImportStatusSchema = ImportCountsSchema.extend({
    importedAt: z.iso.datetime(),
    channel: ImportChannelSchema,
    player: ImportPlayerSchema,
    notesRadar: NotesRadarSchema.nullable(),
})
export type ImportStatus = z.infer<typeof ImportStatusSchema>

export const ImportStatusResponseSchema = z.object({ latest: ImportStatusSchema.nullable() })
export type ImportStatusResponse = z.infer<typeof ImportStatusResponseSchema>

export const ExtensionSessionSchema = z.object({
    user: z.object({ id: z.uuid(), name: z.string(), handle: HandleSchema }).nullable(),
})
export type ExtensionSession = z.infer<typeof ExtensionSessionSchema>

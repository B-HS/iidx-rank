import { z } from 'zod'

export const RANKS = ['F', 'E', 'D', 'C', 'B', 'B+', 'A', 'A+', 'S', 'S+'] as const
export const DIFFICULTIES = ['H', 'A', 'L'] as const

export const RankSchema = z.enum(RANKS).nullable()
export const DifficultySchema = z.enum(DIFFICULTIES)

export const ChartSchema = z.object({
    id: z.string().regex(/^chart-[a-f0-9]{32}$/),
    title: z.string().min(1),
    difficulty: DifficultySchema,
    version: z.string().min(1),
    normalRank: RankSchema,
    hardRank: RankSchema,
    normalPersonal: z.boolean(),
    hardPersonal: z.boolean(),
})

export type Chart = z.infer<typeof ChartSchema>

export const CatalogSourceSchema = z.object({
    updatedAt: z.string().nullable(),
    fetchedAt: z.iso.datetime().nullable(),
    chartCount: z.number().int().nonnegative(),
    status: z.enum(['ready', 'empty']),
    url: z.url(),
})

export type CatalogSource = z.infer<typeof CatalogSourceSchema>

export const CatalogSchema = z.object({
    charts: z.array(ChartSchema),
    source: CatalogSourceSchema,
})

export type Catalog = z.infer<typeof CatalogSchema>

export const CatalogSyncResultSchema = z.object({ source: CatalogSourceSchema })

export type CatalogSyncResult = z.infer<typeof CatalogSyncResultSchema>

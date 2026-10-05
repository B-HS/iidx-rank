import { z } from 'zod'
import { ChartSchema } from '@entities/catalog/catalog.dto'

export const LAMPS = ['NO_PLAY', 'FAILED', 'ASSIST', 'EASY', 'CLEAR', 'HARD', 'EX_HARD', 'FULL_COMBO'] as const
export const MAX_MEMO_LENGTH = 500
export const SCORE_GRADES = ['F', 'E', 'D', 'C', 'B', 'A', 'AA', 'AAA'] as const

export const RecordSchema = z.object({
    chartId: ChartSchema.shape.id,
    lamp: z.enum(LAMPS),
    scoreGrade: z.enum(SCORE_GRADES).nullable().default(null),
    memo: z.string().max(MAX_MEMO_LENGTH),
    updatedAt: z.iso.datetime(),
})

export type Record = z.infer<typeof RecordSchema>

export const RecordInputSchema = RecordSchema.omit({ updatedAt: true }).extend({
    memo: RecordSchema.shape.memo.default(''),
    scoreGrade: RecordSchema.shape.scoreGrade.removeDefault().optional(),
})

export type RecordInput = z.infer<typeof RecordInputSchema>

export const CheckerSchema = z.object({
    userId: z.uuid(),
    records: z.array(RecordSchema),
})

export type Checker = z.infer<typeof CheckerSchema>

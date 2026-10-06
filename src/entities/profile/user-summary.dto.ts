import { z } from 'zod'

export const HANDLE_PATTERN = /^[a-z0-9_]{3,20}$/
export const HandleSchema = z.string().regex(HANDLE_PATTERN)

export const UserSummarySchema = z.object({
    handle: HandleSchema,
    name: z.string(),
    avatarUrl: z.string().nullable(),
    isPublic: z.boolean(),
})
export type UserSummary = z.infer<typeof UserSummarySchema>

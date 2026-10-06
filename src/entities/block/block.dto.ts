import { z } from 'zod'
import { UserSummarySchema } from '@entities/profile/user-summary.dto'

export const BlockedUserSchema = UserSummarySchema.pick({ handle: true, name: true, avatarUrl: true })
export type BlockedUser = z.infer<typeof BlockedUserSchema>

export const BlockListSchema = z.object({ users: z.array(BlockedUserSchema) })
export type BlockList = z.infer<typeof BlockListSchema>

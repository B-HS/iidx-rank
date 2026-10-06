import 'server-only'
import { BlockListSchema } from '@entities/block/block.dto'
import { deleteBlock, insertBlock, readBlockedUserRows, readUserIdByHandle } from '@entities/block/block.storage'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { toUserSummary } from '@entities/profile/user-summary.server'

export type BlockFailureReason = 'USER_NOT_FOUND' | 'SELF_TARGET'

const failure = <Reason extends BlockFailureReason>(reason: Reason) => ({ ok: false as const, reason })

export const getBlockList = async (userId: string) => BlockListSchema.parse({ users: (await readBlockedUserRows(userId)).map(toUserSummary) })

const changeBlock = async (userId: string, handle: string, write: typeof insertBlock) => {
    const targetId = await readUserIdByHandle(HandleSchema.parse(handle))

    if (!targetId) return failure('USER_NOT_FOUND')
    if (targetId === userId) return failure('SELF_TARGET')

    await write(userId, targetId)

    return { ok: true as const, list: await getBlockList(userId) }
}

export const blockUser = async (userId: string, handle: string) => await changeBlock(userId, handle, insertBlock)

export const unblockUser = async (userId: string, handle: string) => await changeBlock(userId, handle, deleteBlock)

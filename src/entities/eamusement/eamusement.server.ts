import 'server-only'
import { CheckerSchema } from '@entities/checker/checker.dto'
import type { ImportChannel, ImportInput } from '@entities/eamusement/eamusement.dto'
import { ExtensionSessionSchema, ImportResultSchema, ImportStatusResponseSchema } from '@entities/eamusement/eamusement.dto'
import { readLatestImport, readLatestPlayerImport, toNotesRadar, writeImport } from '@entities/eamusement/eamusement.storage'
import { getMyProfile } from '@entities/profile/profile.server'

const UserIdSchema = CheckerSchema.shape.userId

export const importRecords = async (userId: string, channel: ImportChannel, input: ImportInput) => {
    const outcome = await writeImport(UserIdSchema.parse(userId), channel, input)

    if (outcome.status === 'COOLDOWN') return outcome

    return { status: outcome.status, result: ImportResultSchema.parse(outcome.result) }
}

export const getImportStatus = async (userId: string) => {
    const validatedUserId = UserIdSchema.parse(userId)
    const [latestImport, latestPlayerImport] = await Promise.all([readLatestImport(validatedUserId), readLatestPlayerImport(validatedUserId)])

    if (!latestImport) return ImportStatusResponseSchema.parse({ latest: null })

    const playerImport = latestPlayerImport ?? latestImport

    return ImportStatusResponseSchema.parse({
        latest: {
            importedAt: latestImport.createdAt,
            channel: latestImport.channel,
            receivedCount: latestImport.receivedCount,
            matchedCount: latestImport.matchedCount,
            changedCount: latestImport.changedCount,
            player: {
                djName: playerImport.djName,
                iidxId: playerImport.iidxId,
                danRank: playerImport.danRank,
                djPoint: playerImport.djPoint,
                playCountSp: playerImport.playCountSp,
                playCountDp: playerImport.playCountDp,
            },
            notesRadar: toNotesRadar(playerImport),
        },
    })
}

export const getExtensionSession = async (userId: string) => {
    const profile = await getMyProfile(userId)

    if (!profile) return null

    return ExtensionSessionSchema.parse({ user: { id: profile.userId, name: profile.name, handle: profile.handle } })
}

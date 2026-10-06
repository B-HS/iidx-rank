import 'server-only'
import { and, count, eq, gte } from 'drizzle-orm'
import { FILE_UPLOAD_RULES, FileKeySchema, getFileUrl, type FilePurpose } from '@entities/file/file.dto'
import { IMAGE_EXTENSION_BY_MIME, detectImageMime } from '@entities/file/file-signature'
import { getDb } from '@shared/server/db/get-db'
import { uploadedFile } from '@shared/server/db/file-schema'
import { deleteR2Object, isR2Configured, putR2Object } from '@shared/server/r2'

const UPLOAD_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const UPLOAD_RATE_LIMIT_MAX_FILES = 30

export type UploadFailureReason = 'TOO_LARGE' | 'UNSUPPORTED_TYPE' | 'RATE_LIMITED' | 'STORAGE_UNAVAILABLE'

const failure = <Reason extends UploadFailureReason>(reason: Reason) => ({ ok: false as const, reason })

const tryDeleteStoredObject = async (key: string) => {
    try {
        await deleteR2Object(key)
        return true
    } catch {
        return false
    }
}

export const saveUploadedImage = async (userId: string, purpose: FilePurpose, file: File) => {
    if (!isR2Configured()) return failure('STORAGE_UNAVAILABLE')

    const rule = FILE_UPLOAD_RULES[purpose]

    if (file.size > rule.maxBytes) return failure('TOO_LARGE')

    const buffer = await file.arrayBuffer()
    const mime = detectImageMime(new Uint8Array(buffer))

    if (mime === null || !rule.mimeTypes.includes(mime)) return failure('UNSUPPORTED_TYPE')

    const database = getDb()
    const windowStart = new Date(Date.now() - UPLOAD_RATE_LIMIT_WINDOW_MS).toISOString()
    const [recent] = await database
        .select({ total: count() })
        .from(uploadedFile)
        .where(and(eq(uploadedFile.ownerId, userId), gte(uploadedFile.createdAt, windowStart)))

    if ((recent?.total ?? 0) >= UPLOAD_RATE_LIMIT_MAX_FILES) return failure('RATE_LIMITED')

    const key = `${purpose}/${crypto.randomUUID()}.${IMAGE_EXTENSION_BY_MIME[mime]}`

    try {
        await putR2Object(key, buffer, mime)
    } catch {
        return failure('STORAGE_UNAVAILABLE')
    }

    try {
        await database.insert(uploadedFile).values({
            key,
            ownerId: userId,
            purpose,
            contentType: mime,
            size: buffer.byteLength,
            createdAt: new Date().toISOString(),
        })
    } catch (error) {
        await tryDeleteStoredObject(key)
        throw error
    }

    return { ok: true as const, key, url: getFileUrl(key) }
}

export const isOwnedFile = async (ownerId: string, key: string, purpose: FilePurpose) => {
    const parsedKey = FileKeySchema.safeParse(key)

    if (!parsedKey.success) return false

    const rows = await getDb()
        .select({ key: uploadedFile.key })
        .from(uploadedFile)
        .where(and(eq(uploadedFile.key, parsedKey.data), eq(uploadedFile.ownerId, ownerId), eq(uploadedFile.purpose, purpose)))
        .limit(1)

    return rows.length > 0
}

export const deleteUploadedFile = async (ownerId: string, key: string) => {
    const parsedKey = FileKeySchema.safeParse(key)

    if (!parsedKey.success) return 'NOT_FOUND' as const

    const database = getDb()
    const ownership = and(eq(uploadedFile.key, parsedKey.data), eq(uploadedFile.ownerId, ownerId))
    const rows = await database.select({ key: uploadedFile.key }).from(uploadedFile).where(ownership).limit(1)

    if (rows.length === 0) return 'NOT_FOUND' as const
    if (!isR2Configured() || !(await tryDeleteStoredObject(parsedKey.data))) return 'STORAGE_UNAVAILABLE' as const

    await database.delete(uploadedFile).where(ownership)

    return 'DELETED' as const
}

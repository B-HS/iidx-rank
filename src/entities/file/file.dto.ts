import { z } from 'zod'
import { IMAGE_EXTENSION_BY_MIME, type ImageMime } from '@entities/file/file-signature'
import { FILE_PURPOSES } from '@shared/constants/file'

const BYTES_PER_MEGABYTE = 1024 * 1024
const AVATAR_MAX_MEGABYTES = 2
const BOARD_MAX_MEGABYTES = 4
const MULTIPART_OVERHEAD_BYTES = 64 * 1024

export const FILE_URL_PREFIX = '/api/files/'

export const FilePurposeSchema = z.enum(FILE_PURPOSES)
export type FilePurpose = z.infer<typeof FilePurposeSchema>

export const FILE_KEY_PATTERN = /^(avatar|board)\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/

export const FileKeySchema = z.string().regex(FILE_KEY_PATTERN)
export const ImageExtensionSchema = z.enum(IMAGE_EXTENSION_BY_MIME)

export const FILE_UPLOAD_RULES: Record<FilePurpose, { maxBytes: number; mimeTypes: readonly ImageMime[] }> = {
    avatar: { maxBytes: AVATAR_MAX_MEGABYTES * BYTES_PER_MEGABYTE, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
    board: { maxBytes: BOARD_MAX_MEGABYTES * BYTES_PER_MEGABYTE, mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
}

export const MAX_UPLOAD_REQUEST_BYTES = Math.max(...Object.values(FILE_UPLOAD_RULES).map((rule) => rule.maxBytes)) + MULTIPART_OVERHEAD_BYTES

export const getFileUrl = (key: string) => `${FILE_URL_PREFIX}${key}`

export const UploadResponseSchema = z.object({ key: FileKeySchema, url: z.string().startsWith(FILE_URL_PREFIX) })
export type UploadResponse = z.infer<typeof UploadResponseSchema>

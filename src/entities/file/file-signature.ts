export const IMAGE_EXTENSION_BY_MIME = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
} as const

export type ImageMime = keyof typeof IMAGE_EXTENSION_BY_MIME
export type ImageExtension = (typeof IMAGE_EXTENSION_BY_MIME)[ImageMime]

export const IMAGE_MIME_BY_EXTENSION = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
} as const satisfies Record<ImageExtension, ImageMime>

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff]
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]
const GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46]
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50]
const WEBP_SIGNATURE_OFFSET = 8

const hasSignatureAt = (bytes: Uint8Array, signature: readonly number[], offset = 0) =>
    bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte)

export const detectImageMime = (bytes: Uint8Array): ImageMime | null => {
    if (hasSignatureAt(bytes, JPEG_SIGNATURE)) return 'image/jpeg'
    if (hasSignatureAt(bytes, PNG_SIGNATURE)) return 'image/png'
    if (hasSignatureAt(bytes, GIF87A_SIGNATURE) || hasSignatureAt(bytes, GIF89A_SIGNATURE)) return 'image/gif'
    if (hasSignatureAt(bytes, RIFF_SIGNATURE) && hasSignatureAt(bytes, WEBP_SIGNATURE, WEBP_SIGNATURE_OFFSET)) return 'image/webp'

    return null
}

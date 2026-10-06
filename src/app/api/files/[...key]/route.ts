import { FileKeySchema, ImageExtensionSchema } from '@entities/file/file.dto'
import { IMAGE_MIME_BY_EXTENSION } from '@entities/file/file-signature'
import { API_STATUS, errorResponse } from '@shared/server/http'
import { R2_OBJECT_CACHE_CONTROL, getR2Object, isR2Configured } from '@shared/server/r2'

const notFoundResponse = () => errorResponse('FILE_NOT_FOUND', '파일을 찾을 수 없습니다.', API_STATUS.NOT_FOUND)
const unavailableResponse = () => errorResponse('FILE_STORAGE_UNAVAILABLE', '파일 저장소를 사용할 수 없습니다.', API_STATUS.SERVICE_UNAVAILABLE)

export const GET = async (_request: Request, { params }: { params: Promise<{ key: string[] }> }) => {
    const { key: segments } = await params
    const parsedKey = FileKeySchema.safeParse(segments.join('/'))

    if (!parsedKey.success) return notFoundResponse()
    if (!isR2Configured()) return unavailableResponse()

    try {
        const upstream = await getR2Object(parsedKey.data)

        if (upstream.status === API_STATUS.NOT_FOUND) {
            await upstream.arrayBuffer()
            return notFoundResponse()
        }

        if (!upstream.ok || !upstream.body) {
            await upstream.arrayBuffer()
            return unavailableResponse()
        }

        const contentType = IMAGE_MIME_BY_EXTENSION[ImageExtensionSchema.parse(parsedKey.data.slice(parsedKey.data.lastIndexOf('.') + 1))]
        const headers = new Headers({
            'Content-Type': contentType,
            'Cache-Control': R2_OBJECT_CACHE_CONTROL,
            'X-Content-Type-Options': 'nosniff',
        })
        const contentLength = upstream.headers.get('content-length')

        if (contentLength !== null) headers.set('Content-Length', contentLength)

        return new Response(upstream.body, { headers })
    } catch {
        return unavailableResponse()
    }
}

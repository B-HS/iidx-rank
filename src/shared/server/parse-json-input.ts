import { z } from 'zod'
import { API_STATUS, errorResponse } from '@shared/server/http'

const MAX_JSON_REQUEST_BODY_BYTES = 4096

export const parseJsonInput = async <Output>(request: Request, schema: z.ZodType<Output>) => {
    const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()

    if (contentType !== 'application/json') {
        return { response: errorResponse('UNSUPPORTED_MEDIA_TYPE', 'JSON 형식으로 요청해 주세요.', API_STATUS.UNSUPPORTED_MEDIA_TYPE) }
    }

    const contentLength = request.headers.get('content-length')

    if (contentLength !== null && Number(contentLength) > MAX_JSON_REQUEST_BODY_BYTES) {
        return { response: errorResponse('PAYLOAD_TOO_LARGE', '요청 본문이 너무 큽니다.', API_STATUS.PAYLOAD_TOO_LARGE) }
    }

    const reader = request.body?.getReader()

    if (!reader) return { response: errorResponse('MALFORMED_JSON', '요청 본문을 JSON으로 읽을 수 없습니다.') }

    const chunks: Uint8Array[] = []
    let totalBytes = 0

    try {
        while (true) {
            const chunk = await reader.read()

            if (chunk.done) break

            totalBytes += chunk.value.byteLength

            if (totalBytes > MAX_JSON_REQUEST_BODY_BYTES) {
                await reader.cancel()
                return { response: errorResponse('PAYLOAD_TOO_LARGE', '요청 본문이 너무 큽니다.', API_STATUS.PAYLOAD_TOO_LARGE) }
            }

            chunks.push(chunk.value)
        }

        const bytes = new Uint8Array(totalBytes)
        let offset = 0

        for (const chunk of chunks) {
            bytes.set(chunk, offset)
            offset += chunk.byteLength
        }

        const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
        const parsed = schema.safeParse(payload)

        if (!parsed.success) {
            return { response: errorResponse('INVALID_INPUT', '입력값이 올바르지 않습니다.') }
        }

        const input = parsed.data

        return { input }
    } catch {
        return { response: errorResponse('MALFORMED_JSON', '요청 본문을 JSON으로 읽을 수 없습니다.') }
    } finally {
        reader.releaseLock()
    }
}

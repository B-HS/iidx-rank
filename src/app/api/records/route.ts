import { revalidateTag } from 'next/cache'
import type { RecordInput } from '@entities/checker/checker.dto'
import { RecordInputSchema } from '@entities/checker/checker.dto'
import { getChecker, upsertRecord } from '@entities/checker/checker.server'
import { getSession } from '@shared/server/auth'
import { userRecordsTag } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

const MAX_RECORD_REQUEST_BODY_BYTES = 4096

const parseRecordInput = async (request: Request) => {
    const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase()

    if (contentType !== 'application/json') {
        return { response: errorResponse('UNSUPPORTED_MEDIA_TYPE', 'JSON 형식으로 요청해 주세요.', API_STATUS.UNSUPPORTED_MEDIA_TYPE) }
    }

    const contentLength = request.headers.get('content-length')

    if (contentLength !== null && Number(contentLength) > MAX_RECORD_REQUEST_BODY_BYTES) {
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

            if (totalBytes > MAX_RECORD_REQUEST_BODY_BYTES) {
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
        const parsed = RecordInputSchema.safeParse(payload)

        if (!parsed.success) {
            return { response: errorResponse('INVALID_INPUT', '기록 입력이 올바르지 않습니다.') }
        }

        const input: RecordInput = parsed.data

        return { input }
    } catch {
        return { response: errorResponse('MALFORMED_JSON', '요청 본문을 JSON으로 읽을 수 없습니다.') }
    } finally {
        reader.releaseLock()
    }
}

export const GET = async () => {
    let session

    try {
        session = await getSession()
    } catch {
        return errorResponse(
            'AUTH_UNAVAILABLE',
            '인증 서비스를 사용할 수 없습니다. 서버의 BETTER_AUTH_SECRET과 DB 설정을 확인해 주세요.',
            API_STATUS.SERVICE_UNAVAILABLE,
        )
    }

    if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

    try {
        return successResponse(await getChecker(session.user.id))
    } catch {
        return errorResponse('INTERNAL_ERROR', '기록을 불러오지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

export const PATCH = async (request: Request) => {
    let isTrustedRequest: boolean

    try {
        isTrustedRequest = isTrustedOrigin(request.headers.get('origin'))
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다. 서버 설정을 확인해 주세요.', API_STATUS.SERVICE_UNAVAILABLE)
    }

    if (!isTrustedRequest) return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

    let session

    try {
        session = await getSession()
    } catch {
        return errorResponse(
            'AUTH_UNAVAILABLE',
            '인증 서비스를 사용할 수 없습니다. 서버의 BETTER_AUTH_SECRET과 DB 설정을 확인해 주세요.',
            API_STATUS.SERVICE_UNAVAILABLE,
        )
    }

    if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

    const parsed = await parseRecordInput(request)

    if ('response' in parsed) return parsed.response

    try {
        const record = await upsertRecord(session.user.id, parsed.input)

        if (!record) return errorResponse('CHART_UNAVAILABLE', '현재 기록할 수 없는 차트입니다.', API_STATUS.BAD_REQUEST)

        revalidateTag(userRecordsTag(session.user.id), { expire: 0 })

        return successResponse(record)
    } catch {
        return errorResponse('INTERNAL_ERROR', '기록을 저장하지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

import { revalidateTag } from 'next/cache'
import { RecordInputSchema } from '@entities/checker/checker.dto'
import { getChecker, upsertRecord } from '@entities/checker/checker.server'
import { parseJsonInput } from '@shared/server/parse-json-input'
import { getSession } from '@shared/server/auth'
import { userRecordsTag } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

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

    const parsed = await parseJsonInput(request, RecordInputSchema)

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

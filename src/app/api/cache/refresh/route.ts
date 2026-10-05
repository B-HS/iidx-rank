import { revalidateTag } from 'next/cache'
import { getChecker } from '@entities/checker/checker.server'
import { getSession } from '@shared/server/auth'
import { userRecordsTag } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

export const POST = async (request: Request) => {
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

    try {
        revalidateTag(userRecordsTag(session.user.id), { expire: 0 })

        return successResponse(await getChecker(session.user.id))
    } catch {
        return errorResponse('INTERNAL_ERROR', '기록 캐시를 새로고침하지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

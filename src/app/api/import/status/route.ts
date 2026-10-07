import { getImportStatus } from '@entities/eamusement/eamusement.server'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async () => {
    let session

    try {
        session = await getSession()
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다. 서버 설정을 확인해 주세요.', API_STATUS.SERVICE_UNAVAILABLE)
    }

    if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

    try {
        return successResponse(await getImportStatus(session.user.id))
    } catch {
        return errorResponse('INTERNAL_ERROR', '가져오기 상태를 불러오지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

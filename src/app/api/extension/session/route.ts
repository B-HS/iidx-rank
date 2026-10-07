import { ExtensionSessionSchema } from '@entities/eamusement/eamusement.dto'
import { getExtensionSession } from '@entities/eamusement/eamusement.server'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async () => {
    try {
        const session = await getSession()

        if (!session) return successResponse(ExtensionSessionSchema.parse({ user: null }))

        const extensionSession = await getExtensionSession(session.user.id)

        if (!extensionSession) return errorResponse('PROFILE_UNAVAILABLE', '프로필을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)

        return successResponse(extensionSession)
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다. 서버 설정을 확인해 주세요.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

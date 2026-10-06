import { getBlockList } from '@entities/block/block.server'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async () => {
    try {
        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        return successResponse(await getBlockList(session.user.id))
    } catch {
        return errorResponse('INTERNAL_ERROR', '차단 목록을 불러오지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

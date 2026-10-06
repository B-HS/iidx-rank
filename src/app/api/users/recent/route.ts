import { connection } from 'next/server'
import { getRecentUsers } from '@entities/profile/profile.server'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async () => {
    await connection()

    try {
        return successResponse(await getRecentUsers())
    } catch {
        return errorResponse('RECENT_USERS_UNAVAILABLE', '최근 갱신 사용자를 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

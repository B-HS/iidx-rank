import { connection } from 'next/server'
import { UserListPageQuerySchema } from '@entities/profile/profile.dto'
import { getUserList } from '@entities/profile/profile.server'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async (request: Request) => {
    await connection()

    const parsedQuery = UserListPageQuerySchema.safeParse({ page: new URL(request.url).searchParams.get('page') ?? undefined })

    if (!parsedQuery.success) return errorResponse('VALIDATION_ERROR', '페이지 번호를 확인해 주세요.', API_STATUS.BAD_REQUEST)

    try {
        return successResponse(await getUserList(parsedQuery.data.page))
    } catch {
        return errorResponse('USERS_UNAVAILABLE', '사용자 목록을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

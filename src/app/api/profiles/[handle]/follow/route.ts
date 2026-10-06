import { setProfileFollow } from '@entities/profile/profile.server'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

type FollowRouteContext = { params: Promise<{ handle: string }> }

const notFoundResponse = () => errorResponse('PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.', API_STATUS.NOT_FOUND)

const handleFollowChange = async (request: Request, { params }: FollowRouteContext, shouldFollow: boolean) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin')))
            return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        const { handle } = await params
        const parsedHandle = HandleSchema.safeParse(handle)

        if (!parsedHandle.success) return notFoundResponse()

        const result = await setProfileFollow(session.user.id, parsedHandle.data, shouldFollow)

        if (result.status === 'NOT_FOUND') return notFoundResponse()
        if (result.status === 'SELF') return errorResponse('CANNOT_FOLLOW_SELF', '자기 자신은 팔로우할 수 없습니다.')

        return successResponse(result.profile)
    } catch {
        return errorResponse('PROFILE_UNAVAILABLE', '팔로우 상태를 변경하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

export const PUT = (request: Request, context: FollowRouteContext) => handleFollowChange(request, context, true)

export const DELETE = (request: Request, context: FollowRouteContext) => handleFollowChange(request, context, false)

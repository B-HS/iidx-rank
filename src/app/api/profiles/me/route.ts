import { revalidateTag } from 'next/cache'
import { ProfileUpdateInputSchema } from '@entities/profile/profile.dto'
import { getMyProfile, updateMyProfile } from '@entities/profile/profile.server'
import { getSession } from '@shared/server/auth'
import { RECENT_USERS_TAG } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'
import { parseJsonInput } from '@shared/server/parse-json-input'

export const GET = async () => {
    try {
        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        const profile = await getMyProfile(session.user.id)

        if (!profile) return errorResponse('PROFILE_UNAVAILABLE', '프로필을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)

        return successResponse(profile)
    } catch {
        return errorResponse('PROFILE_UNAVAILABLE', '프로필을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

export const PATCH = async (request: Request) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin')))
            return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        const parsed = await parseJsonInput(request, ProfileUpdateInputSchema)

        if ('response' in parsed) return parsed.response

        const result = await updateMyProfile(session.user.id, parsed.input)

        if (result.status === 'HANDLE_TAKEN') return errorResponse('HANDLE_TAKEN', '이미 사용 중인 핸들입니다.', API_STATUS.CONFLICT)
        if (result.status === 'AVATAR_NOT_OWNED') return errorResponse('INVALID_AVATAR', '프로필 사진으로 사용할 수 없는 파일입니다.')
        if (result.status === 'PROFILE_MISSING')
            return errorResponse('PROFILE_UNAVAILABLE', '프로필을 저장하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)

        revalidateTag(RECENT_USERS_TAG, { expire: 0 })

        return successResponse(result.profile)
    } catch {
        return errorResponse('PROFILE_UNAVAILABLE', '프로필을 저장하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

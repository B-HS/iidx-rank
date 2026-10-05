import { revalidateTag } from 'next/cache'
import { DisplayPreferencesInputSchema } from '@entities/preferences/preferences.dto'
import { getDisplayPreferences, saveDisplayPreferences } from '@entities/preferences/preferences.server'
import { getSession } from '@shared/server/auth'
import { userPreferencesTag } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'
import { parseJsonInput } from '@shared/server/parse-json-input'

export const GET = async () => {
    try {
        const session = await getSession()
        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)
        return successResponse(await getDisplayPreferences(session.user.id))
    } catch {
        return errorResponse('PREFERENCES_UNAVAILABLE', '표시 설정을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}
export const PATCH = async (request: Request) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin')))
            return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)
        const session = await getSession()
        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)
        const parsed = await parseJsonInput(request, DisplayPreferencesInputSchema)
        if ('response' in parsed) return parsed.response
        const result = await saveDisplayPreferences(session.user.id, parsed.input)
        revalidateTag(userPreferencesTag(session.user.id), { expire: 0 })
        return successResponse(result)
    } catch {
        return errorResponse('PREFERENCES_UNAVAILABLE', '표시 설정을 저장하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

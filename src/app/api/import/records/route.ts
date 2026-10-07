import { revalidateTag } from 'next/cache'
import type { ImportChannel } from '@entities/eamusement/eamusement.dto'
import { ImportInputSchema } from '@entities/eamusement/eamusement.dto'
import { importRecords } from '@entities/eamusement/eamusement.server'
import { IMPORT_MAX_BODY_BYTES, IMPORT_STYLE } from '@shared/constants/eamusement'
import { getSession } from '@shared/server/auth'
import { RECENT_USERS_TAG, userRecordsTag } from '@shared/server/cache-tags'
import { API_STATUS, errorResponse, isExtensionOrigin, isTrustedOrigin, successResponse } from '@shared/server/http'
import { parseJsonInput } from '@shared/server/parse-json-input'

const resolveImportChannel = (origin: string | null) => {
    if (isTrustedOrigin(origin)) return 'file'
    if (isExtensionOrigin(origin)) return 'extension'

    return null
}

export const POST = async (request: Request) => {
    let channel: ImportChannel | null

    try {
        channel = resolveImportChannel(request.headers.get('origin'))
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다. 서버 설정을 확인해 주세요.', API_STATUS.SERVICE_UNAVAILABLE)
    }

    if (!channel) return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

    let session

    try {
        session = await getSession()
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다. 서버 설정을 확인해 주세요.', API_STATUS.SERVICE_UNAVAILABLE)
    }

    if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

    const parsed = await parseJsonInput(request, ImportInputSchema, IMPORT_MAX_BODY_BYTES)

    if ('response' in parsed) return parsed.response
    if (parsed.input.style !== IMPORT_STYLE.SP) return errorResponse('UNSUPPORTED_STYLE', 'SP 기록만 가져올 수 있습니다.', API_STATUS.BAD_REQUEST)

    try {
        const outcome = await importRecords(session.user.id, channel, parsed.input)

        if (outcome.status === 'COOLDOWN') {
            return errorResponse('IMPORT_COOLDOWN', '잠시 후 다시 시도해 주세요.', API_STATUS.TOO_MANY_REQUESTS)
        }

        revalidateTag(userRecordsTag(session.user.id), { expire: 0 })
        revalidateTag(RECENT_USERS_TAG, { expire: 0 })

        return successResponse(outcome.result)
    } catch {
        return errorResponse('INTERNAL_ERROR', '기록을 가져오지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

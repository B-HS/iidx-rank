import { revalidateTag } from 'next/cache'
import { CatalogSyncResultSchema } from '@entities/catalog/catalog.dto'
import { CATALOG_CACHE_TAG } from '@entities/catalog/catalog.server'
import { CatalogSyncCooldownError, syncCatalogFromSource } from '@entities/catalog/catalog.storage'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

export const POST = async (request: Request) => {
    if (!isTrustedOrigin(request.headers.get('origin'))) {
        return errorResponse('ORIGIN_FORBIDDEN', '허용되지 않은 요청입니다.', API_STATUS.FORBIDDEN)
    }

    try {
        const session = await getSession()
        if (session === null) {
            return errorResponse('AUTH_REQUIRED', '로그인이 필요합니다.', API_STATUS.UNAUTHORIZED)
        }

        const source = await syncCatalogFromSource()
        revalidateTag(CATALOG_CACHE_TAG, { expire: 0 })

        return successResponse(CatalogSyncResultSchema.parse({ source }))
    } catch (error) {
        if (error instanceof CatalogSyncCooldownError) {
            return errorResponse('SYNC_COOLDOWN', '원본 동기화는 잠시 후 다시 시도해 주세요.', API_STATUS.TOO_MANY_REQUESTS)
        }

        return errorResponse('SYNC_FAILED', '곡 목록 동기화를 완료하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

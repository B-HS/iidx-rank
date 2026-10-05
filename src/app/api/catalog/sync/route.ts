import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { CatalogSyncResultSchema } from '@entities/catalog/catalog.dto'
import { CATALOG_CACHE_TAG } from '@entities/catalog/catalog.server'
import { CatalogSyncCooldownError, readCatalogState, syncCatalogFromSource } from '@entities/catalog/catalog.storage'
import { USER_ROLE } from '@shared/constants/user-role'
import { getSession } from '@shared/server/auth'
import { getEnv } from '@shared/server/env'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

export const maxDuration = 60

const runCatalogSync = async () => {
    try {
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

export const POST = async (request: Request) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin'))) {
            return errorResponse('ORIGIN_FORBIDDEN', '허용되지 않은 요청입니다.', API_STATUS.FORBIDDEN)
        }
        const session = await getSession()
        if (session === null) return errorResponse('AUTH_REQUIRED', '로그인이 필요합니다.', API_STATUS.UNAUTHORIZED)
        if (session.user.role !== USER_ROLE.ADMIN) return errorResponse('ADMIN_REQUIRED', '관리자만 원본을 갱신할 수 있습니다.', API_STATUS.FORBIDDEN)
        return await runCatalogSync()
    } catch {
        return errorResponse('AUTH_UNAVAILABLE', '인증 서비스를 사용할 수 없습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

export const GET = async (request: Request) => {
    try {
        const secret = getEnv().CRON_SECRET
        const authorization = request.headers.get('authorization') ?? ''
        if (!secret) return errorResponse('AUTH_REQUIRED', '허용되지 않은 요청입니다.', API_STATUS.UNAUTHORIZED)
        const supplied = Buffer.from(authorization)
        const expected = Buffer.from('Bearer ' + secret)
        if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
            return errorResponse('AUTH_REQUIRED', '허용되지 않은 요청입니다.', API_STATUS.UNAUTHORIZED)
        }
        const { source } = await readCatalogState()
        if (source.fetchedAt?.slice(0, 10) === new Date().toISOString().slice(0, 10)) {
            return successResponse(CatalogSyncResultSchema.parse({ source }))
        }
        return await runCatalogSync()
    } catch {
        return errorResponse('SYNC_FAILED', '곡 목록 동기화를 완료하지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

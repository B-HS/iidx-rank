import { revalidateTag } from 'next/cache'
import { getCatalog, CATALOG_CACHE_TAG, ensureCatalogFresh } from '@entities/catalog/catalog.server'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

export const GET = async () => {
    try {
        const freshness = await ensureCatalogFresh()
        if (freshness.didSync) {
            revalidateTag(CATALOG_CACHE_TAG, { expire: 0 })
        }

        return successResponse(await getCatalog())
    } catch {
        return errorResponse('CATALOG_UNAVAILABLE', '곡 목록을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { CATALOG_TAG } from '@shared/server/cache-tags'
import { readCatalog, readCatalogState } from '@entities/catalog/catalog.storage'

const CATALOG_CACHE_STALE_SECONDS = 300
const CATALOG_CACHE_REVALIDATE_SECONDS = 300
const CATALOG_CACHE_EXPIRE_SECONDS = 3600

export const CATALOG_CACHE_TAG = CATALOG_TAG

const loadCatalog = async (_generation: string) => {
    'use cache'

    cacheTag(CATALOG_CACHE_TAG)
    cacheLife({
        stale: CATALOG_CACHE_STALE_SECONDS,
        revalidate: CATALOG_CACHE_REVALIDATE_SECONDS,
        expire: CATALOG_CACHE_EXPIRE_SECONDS,
    })

    return await readCatalog()
}

export const getCatalog = async () => {
    const { generation } = await readCatalogState()
    return await loadCatalog(generation)
}

export const getCatalogForShell = async () => {
    'use cache'
    cacheTag(CATALOG_CACHE_TAG)
    cacheLife({ stale: CATALOG_CACHE_STALE_SECONDS, revalidate: CATALOG_CACHE_REVALIDATE_SECONDS, expire: CATALOG_CACHE_EXPIRE_SECONDS })
    return await getCatalog()
}

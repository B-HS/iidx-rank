import { queryOptions } from '@tanstack/react-query'

import { fetchCatalog } from '@entities/catalog/catalog.api'
import type { Catalog } from '@entities/catalog/catalog.dto'
import { CATALOG_QUERY_STALE_TIME_MS, QUERY_CACHE_GC_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'

export const catalogQueryOptions = (queryFn: () => Promise<Catalog> = fetchCatalog) =>
    queryOptions({
        queryKey: QUERY_KEY.CATALOG.LIST,
        queryFn,
        staleTime: CATALOG_QUERY_STALE_TIME_MS,
        gcTime: QUERY_CACHE_GC_TIME_MS,
    })

import { queryOptions } from '@tanstack/react-query'
import type { ImportStatusResponse } from '@entities/eamusement/eamusement.dto'
import { fetchImportStatus } from '@entities/eamusement/eamusement.api'
import { QUERY_CACHE_GC_TIME_MS, USER_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'

export const importStatusQueryOptions = (queryFn: () => Promise<ImportStatusResponse> = fetchImportStatus) =>
    queryOptions({ queryKey: QUERY_KEY.EAMUSEMENT.STATUS, queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

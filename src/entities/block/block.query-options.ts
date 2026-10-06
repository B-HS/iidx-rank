import { queryOptions } from '@tanstack/react-query'
import type { BlockList } from '@entities/block/block.dto'
import { fetchBlockList } from '@entities/block/block.api'
import { QUERY_CACHE_GC_TIME_MS, USER_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'

export const blockListQueryOptions = (queryFn: () => Promise<BlockList> = fetchBlockList) =>
    queryOptions({ queryKey: QUERY_KEY.BLOCK.LIST, queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

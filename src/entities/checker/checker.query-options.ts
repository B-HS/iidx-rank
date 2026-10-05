import { queryOptions } from '@tanstack/react-query'

import { fetchChecker } from '@entities/checker/checker.api'
import type { Checker } from '@entities/checker/checker.dto'
import { QUERY_CACHE_GC_TIME_MS, USER_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'
import { MESSAGES } from '@shared/messages/messages'

export const checkerQueryOptions = (userId: string, queryFn: () => Promise<Checker> = fetchChecker) =>
    queryOptions({
        queryKey: QUERY_KEY.CHECKER.RECORDS(userId),
        queryFn: async () => {
            const checker = await queryFn()

            if (checker.userId !== userId) {
                throw new Error(MESSAGES.common.unknownError)
            }

            return checker
        },
        staleTime: USER_QUERY_STALE_TIME_MS,
        gcTime: QUERY_CACHE_GC_TIME_MS,
    })

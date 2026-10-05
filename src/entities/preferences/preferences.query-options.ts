import { queryOptions } from '@tanstack/react-query'
import type { DisplayPreferences } from '@entities/preferences/preferences.dto'
import { fetchDisplayPreferences } from '@entities/preferences/preferences.api'
import { USER_QUERY_STALE_TIME_MS, QUERY_CACHE_GC_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'
export const displayPreferencesQueryOptions = (userId: string, queryFn: () => Promise<DisplayPreferences> = fetchDisplayPreferences) =>
    queryOptions({ queryKey: QUERY_KEY.PREFERENCES.DISPLAY(userId), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

import { queryOptions } from '@tanstack/react-query'
import type { MyProfile, Profile, ProfileRecords, UserList } from '@entities/profile/profile.dto'
import { fetchMyProfile, fetchProfile, fetchProfileRecords, fetchUserList } from '@entities/profile/profile.api'
import { QUERY_CACHE_GC_TIME_MS, USER_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'

export const myProfileQueryOptions = (queryFn: () => Promise<MyProfile> = fetchMyProfile) =>
    queryOptions({ queryKey: QUERY_KEY.PROFILE.ME, queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

export const profileQueryOptions = (handle: string, queryFn: () => Promise<Profile> = () => fetchProfile(handle)) =>
    queryOptions({ queryKey: QUERY_KEY.PROFILE.DETAIL(handle), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

export const profileRecordsQueryOptions = (handle: string, queryFn: () => Promise<ProfileRecords> = () => fetchProfileRecords(handle)) =>
    queryOptions({ queryKey: QUERY_KEY.PROFILE.RECORDS(handle), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

export const userListQueryOptions = (page: number, queryFn: () => Promise<UserList> = () => fetchUserList(page)) =>
    queryOptions({ queryKey: QUERY_KEY.USERS.LIST(page), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

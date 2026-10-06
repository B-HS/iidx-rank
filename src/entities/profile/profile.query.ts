'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { followProfile, unfollowProfile, updateMyProfile } from '@entities/profile/profile.api'
import {
    myProfileQueryOptions,
    profileQueryOptions,
    profileRecordsQueryOptions,
    recentUsersQueryOptions,
} from '@entities/profile/profile.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'
import { getApiErrorCode } from '@shared/lib/api-client'

const PROFILE_SAVE_SCOPE_ID = 'profile-save'

export const HANDLE_TAKEN_ERROR_CODE = 'HANDLE_TAKEN'

export const useMyProfile = (enabled: boolean) => useQuery({ ...myProfileQueryOptions(), enabled })

export const useProfile = (handle: string, enabled: boolean) => useQuery({ ...profileQueryOptions(handle), enabled })

export const useProfileRecords = (handle: string) => useQuery(profileRecordsQueryOptions(handle))

export const useRecentUsers = () => useQuery(recentUsersQueryOptions())

export const useUpdateMyProfile = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: updateMyProfile,
        scope: { id: PROFILE_SAVE_SCOPE_ID },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.PROFILE.ALL }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.USERS.ALL }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL }),
            ])
            toast.success(t('settings.saveSuccess'))
        },
        onError: (error) => toast.error(t(getApiErrorCode(error) === HANDLE_TAKEN_ERROR_CODE ? 'settings.handleTaken' : 'settings.saveError')),
    })
}

export const useToggleFollow = (handle: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (shouldFollow: boolean) => (shouldFollow ? followProfile(handle) : unfollowProfile(handle)),
        onSuccess: async (profile) => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.PROFILE.DETAIL(handle) })
            toast.success(profile.isFollowing ? t('social.followSuccess') : t('social.unfollowSuccess'))
        },
        onError: () => toast.error(t('social.followError')),
    })
}

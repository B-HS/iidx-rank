'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { displayPreferencesQueryOptions } from '@entities/preferences/preferences.query-options'
import { updateDisplayPreferences } from '@entities/preferences/preferences.api'
import { QUERY_KEY } from '@shared/constants/query-key'
export const useDisplayPreferences = (userId: string, enabled: boolean) => useQuery({ ...displayPreferencesQueryOptions(userId), enabled })
export const useSaveDisplayPreferences = (userId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateDisplayPreferences,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.PREFERENCES.DISPLAY(userId) })
        },
        onError: () => toast.error(t('display.saveError')),
    })
}

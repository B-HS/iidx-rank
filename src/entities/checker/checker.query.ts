'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { RecordInput } from '@entities/checker/checker.dto'
import { refreshChecker, saveRecord } from '@entities/checker/checker.api'
import { checkerQueryOptions } from '@entities/checker/checker.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'
export const useChecker = (userId: string, enabled: boolean) => useQuery({ ...checkerQueryOptions(userId), enabled })
export const useSaveRecord = (userId: string, shouldNotifySuccess = true) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (input: RecordInput) => saveRecord(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CHECKER.RECORDS(userId) })
            if (shouldNotifySuccess) toast.success(t('checker.recordSaveSuccess'))
        },
        onError: () => toast.error(t('checker.recordSaveError')),
    })
}
export const useRefreshChecker = (userId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: refreshChecker,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CHECKER.RECORDS(userId) })
            toast.success(t('checker.refreshRecordsSuccess'))
        },
        onError: () => toast.error(t('checker.refreshRecordsError')),
    })
}

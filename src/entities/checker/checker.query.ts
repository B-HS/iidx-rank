'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { refreshChecker, saveRecord } from '@entities/checker/checker.api'
import { checkerQueryOptions } from '@entities/checker/checker.query-options'
import type { RecordInput } from '@entities/checker/checker.dto'
import { QUERY_KEY } from '@shared/constants/query-key'
import { MESSAGES } from '@shared/messages/messages'

export const useChecker = (userId: string, enabled: boolean) => useQuery({ ...checkerQueryOptions(userId), enabled })

export const useSaveRecord = (userId: string, shouldNotifySuccess = true) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: RecordInput) => saveRecord(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CHECKER.RECORDS(userId) })
            if (shouldNotifySuccess) toast.success(MESSAGES.checker.recordSaveSuccess)
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : MESSAGES.checker.recordSaveError),
    })
}

export const useRefreshChecker = (userId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: refreshChecker,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CHECKER.RECORDS(userId) })
            toast.success(MESSAGES.checker.refreshRecordsSuccess)
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : MESSAGES.checker.refreshRecordsError),
    })
}

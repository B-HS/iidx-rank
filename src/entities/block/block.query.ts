'use client'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { blockUser, unblockUser } from '@entities/block/block.api'
import { blockListQueryOptions } from '@entities/block/block.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'

const invalidateBlockDependentQueries = async (queryClient: QueryClient) => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEY.BLOCK.ALL }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL }),
    ])
}

export const useBlockedUsers = (enabled: boolean) => useQuery({ ...blockListQueryOptions(), enabled })

export const useBlockUser = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (handle: string) => blockUser(handle),
        onSuccess: async () => {
            await invalidateBlockDependentQueries(queryClient)
            toast.success(t('board.blockSuccess'))
        },
        onError: () => toast.error(t('board.blockError')),
    })
}

export const useUnblockUser = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (handle: string) => unblockUser(handle),
        onSuccess: async () => {
            await invalidateBlockDependentQueries(queryClient)
            toast.success(t('board.unblockSuccess'))
        },
        onError: () => toast.error(t('board.unblockError')),
    })
}

'use client'

import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'

import { syncCatalog } from '@entities/catalog/catalog.api'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'
import { MESSAGES } from '@shared/messages/messages'

export const useCatalog = () => useSuspenseQuery(catalogQueryOptions())

export const useSyncCatalog = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: syncCatalog,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CATALOG.ALL })
            toast.success(MESSAGES.checker.sourceSyncSuccess)
        },
        onError: (error) => toast.error(error instanceof Error ? error.message : MESSAGES.checker.sourceSyncError),
    })
}

'use client'
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { syncCatalog } from '@entities/catalog/catalog.api'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'
export const useCatalog = () => useSuspenseQuery(catalogQueryOptions())
export const useSyncCatalog = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: syncCatalog,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.CATALOG.ALL })
            toast.success(t('checker.sourceSyncSuccess'))
        },
        onError: () => toast.error(t('checker.sourceSyncError')),
    })
}

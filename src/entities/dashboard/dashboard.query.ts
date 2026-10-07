'use client'
import { useQuery } from '@tanstack/react-query'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { useChecker } from '@entities/checker/checker.query'

export const useDashboardCatalog = () => useQuery(catalogQueryOptions())

export const useDashboardRecords = (userId: string) => {
    const catalogQuery = useDashboardCatalog()
    const checkerQuery = useChecker(userId, true)
    const isCatalogFailed = !catalogQuery.data && catalogQuery.isError
    const isCheckerFailed = !checkerQuery.data && checkerQuery.isError

    return {
        charts: catalogQuery.data?.charts,
        records: checkerQuery.data?.records,
        isError: isCatalogFailed || isCheckerFailed,
        isRetrying: catalogQuery.isFetching || checkerQuery.isFetching,
        retry: () => {
            if (isCatalogFailed) void catalogQuery.refetch()
            if (isCheckerFailed) void checkerQuery.refetch()
        },
    }
}

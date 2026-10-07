import { Suspense } from 'react'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { getTranslations } from 'next-intl/server'
import { catalogQueryOptions } from '@entities/catalog/catalog.query-options'
import { getCatalogForShell } from '@entities/catalog/catalog.server'
import { DEFAULT_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { NO_INDEX_ROBOTS } from '@shared/lib/seo'
import { getSession } from '@shared/server/auth'
import { EamusementHandoff } from '@widgets/eamusement-handoff/eamusement-handoff'
import { EamusementHandoffFrame } from '@widgets/eamusement-handoff/eamusement-handoff-frame'
import { EamusementHandoffPending } from '@widgets/eamusement-handoff/eamusement-handoff-pending'

const EamusementHandoffDataBoundary = async () => {
    const [session, catalog] = await Promise.all([getSession(), getCatalogForShell()])
    const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_QUERY_STALE_TIME_MS } } })

    await queryClient.prefetchQuery(catalogQueryOptions(async () => catalog))

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EamusementHandoff initialUserId={session?.user.id ?? null} />
        </HydrationBoundary>
    )
}

const ImportPage = () => (
    <EamusementHandoffFrame>
        <Suspense fallback={<EamusementHandoffPending />}>
            <EamusementHandoffDataBoundary />
        </Suspense>
    </EamusementHandoffFrame>
)

export const generateMetadata = async () => {
    const t = await getTranslations('import')
    return { title: t('title'), robots: NO_INDEX_ROBOTS }
}

export default ImportPage

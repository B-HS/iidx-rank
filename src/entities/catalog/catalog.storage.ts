import { and, eq, isNull, lt, or, sql } from 'drizzle-orm'
import { getDb } from '@shared/server/db/get-db'
import { catalogCharts, catalogSource, type CatalogSourceRow } from '@shared/server/db/catalog-schema'
import { CatalogSchema, type Catalog, type CatalogSource } from '@entities/catalog/catalog.dto'
import { CATALOG_SOURCE_URLS, parseCatalogSources } from '@entities/catalog/catalog.parser'

const CATALOG_SOURCE_ID = 'primary'
const SOURCE_FETCH_TIMEOUT_MS = 10_000
const MAX_SOURCE_RESPONSE_BYTES = 1_000_000
const CATALOG_SYNC_COOLDOWN_MS = 60_000
const SQLITE_BIND_PARAMETER_LIMIT = 999
const CATALOG_CHART_COLUMN_COUNT = 9
const CATALOG_WRITE_BATCH_SIZE = Math.floor(SQLITE_BIND_PARAMETER_LIMIT / CATALOG_CHART_COLUMN_COUNT)

export class CatalogSyncCooldownError extends Error {
    constructor() {
        super('최근에 원본 동기화가 수행되었습니다.')
        this.name = 'CatalogSyncCooldownError'
    }
}

const toCatalogSource = (state: CatalogSourceRow | undefined): CatalogSource => ({
    updatedAt: state?.updatedAt ?? null,
    fetchedAt: state?.fetchedAt ?? null,
    chartCount: state?.chartCount ?? 0,
    status: (state?.chartCount ?? 0) > 0 ? 'ready' : 'empty',
    url: state?.url ?? CATALOG_SOURCE_URLS.normal,
})

export const readCatalogState = async () => {
    const db = getDb()
    const [state] = await db.select().from(catalogSource).where(eq(catalogSource.id, CATALOG_SOURCE_ID)).limit(1)
    const revision = state?.revision ?? 0

    return {
        source: toCatalogSource(state),
        revision,
        generation: String(revision) + ':' + (state?.fetchedAt ?? 'empty'),
        lastAttemptAt: state?.lastAttemptAt ?? null,
    }
}

export const readCatalog = async (): Promise<Catalog> => {
    const db = getDb()

    return await db.transaction(async (transaction) => {
        const [state] = await transaction.select().from(catalogSource).where(eq(catalogSource.id, CATALOG_SOURCE_ID)).limit(1)
        const chartRows = await transaction.select().from(catalogCharts).where(eq(catalogCharts.isActive, true))

        return CatalogSchema.parse({
            charts: chartRows.map((chart) => ({
                id: chart.id,
                title: chart.title,
                difficulty: chart.difficulty,
                version: chart.version,
                normalRank: chart.normalRank,
                hardRank: chart.hardRank,
                normalPersonal: chart.normalPersonal,
                hardPersonal: chart.hardPersonal,
            })),
            source: toCatalogSource(state),
        })
    })
}

export const claimCatalogSync = async (now: string, cooldownBefore: string) => {
    const db = getDb()

    return await db.transaction(async (transaction) => {
        await transaction
            .insert(catalogSource)
            .values({
                id: CATALOG_SOURCE_ID,
                updatedAt: null,
                fetchedAt: null,
                chartCount: 0,
                url: CATALOG_SOURCE_URLS.normal,
                revision: 0,
                lastAttemptAt: null,
            })
            .onConflictDoNothing({ target: catalogSource.id })

        const claimedRows = await transaction
            .update(catalogSource)
            .set({ lastAttemptAt: now })
            .where(
                and(
                    eq(catalogSource.id, CATALOG_SOURCE_ID),
                    or(isNull(catalogSource.lastAttemptAt), lt(catalogSource.lastAttemptAt, cooldownBefore)),
                ),
            )
            .returning({ id: catalogSource.id })

        return claimedRows.length > 0
    })
}

const decodeBoundedResponse = async (url: string) => {
    const response = await fetch(url, {
        cache: 'no-store',
        signal: AbortSignal.timeout(SOURCE_FETCH_TIMEOUT_MS),
    })

    if (!response.ok) {
        await response.body?.cancel()
        throw new Error('원본 서버가 요청을 거부했습니다.')
    }

    const contentLength = response.headers.get('content-length')
    if (contentLength !== null && Number(contentLength) > MAX_SOURCE_RESPONSE_BYTES) {
        await response.body?.cancel()
        throw new Error('원본 응답이 허용 크기를 넘었습니다.')
    }

    if (response.body === null) {
        throw new Error('원본 응답이 비어 있습니다.')
    }

    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let totalBytes = 0

    while (true) {
        const result = await reader.read()
        if (result.done) {
            break
        }

        totalBytes += result.value.byteLength
        if (totalBytes > MAX_SOURCE_RESPONSE_BYTES) {
            await reader.cancel()
            throw new Error('원본 응답이 허용 크기를 넘었습니다.')
        }
        chunks.push(result.value)
    }

    const body = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
        body.set(chunk, offset)
        offset += chunk.byteLength
    }

    return new TextDecoder('utf-8', { fatal: true }).decode(body)
}

const writeCatalog = async (catalog: Catalog) => {
    const db = getDb()
    const chartRows = catalog.charts.map((chart) => ({
        id: chart.id,
        title: chart.title,
        difficulty: chart.difficulty,
        version: chart.version,
        normalRank: chart.normalRank,
        hardRank: chart.hardRank,
        normalPersonal: chart.normalPersonal,
        hardPersonal: chart.hardPersonal,
        isActive: true,
    }))

    await db.transaction(async (transaction) => {
        const [state] = await transaction
            .select({ revision: catalogSource.revision })
            .from(catalogSource)
            .where(eq(catalogSource.id, CATALOG_SOURCE_ID))
            .limit(1)
        const nextRevision = (state?.revision ?? 0) + 1
        await transaction.update(catalogCharts).set({ isActive: false })

        const batches = Array.from({ length: Math.ceil(chartRows.length / CATALOG_WRITE_BATCH_SIZE) }, (_, index) =>
            chartRows.slice(index * CATALOG_WRITE_BATCH_SIZE, (index + 1) * CATALOG_WRITE_BATCH_SIZE),
        )
        for (const batch of batches) {
            await transaction
                .insert(catalogCharts)
                .values(batch)
                .onConflictDoUpdate({
                    target: catalogCharts.id,
                    set: {
                        title: sql`excluded.title`,
                        difficulty: sql`excluded.difficulty`,
                        version: sql`excluded.version`,
                        normalRank: sql`excluded.normal_rank`,
                        hardRank: sql`excluded.hard_rank`,
                        normalPersonal: sql`excluded.normal_personal`,
                        hardPersonal: sql`excluded.hard_personal`,
                        isActive: true,
                    },
                })
        }

        await transaction
            .insert(catalogSource)
            .values({
                id: CATALOG_SOURCE_ID,
                updatedAt: catalog.source.updatedAt,
                fetchedAt: catalog.source.fetchedAt,
                chartCount: catalog.charts.length,
                url: catalog.source.url,
                revision: nextRevision,
                lastAttemptAt: catalog.source.fetchedAt,
            })
            .onConflictDoUpdate({
                target: catalogSource.id,
                set: {
                    updatedAt: catalog.source.updatedAt,
                    fetchedAt: catalog.source.fetchedAt,
                    chartCount: catalog.charts.length,
                    url: catalog.source.url,
                    revision: nextRevision,
                    lastAttemptAt: catalog.source.fetchedAt,
                },
            })
    })
}

const performCatalogSync = async (): Promise<CatalogSource> => {
    const startedAt = new Date()
    const startedAtIso = startedAt.toISOString()
    const cooldownBefore = new Date(startedAt.getTime() - CATALOG_SYNC_COOLDOWN_MS).toISOString()
    const claimed = await claimCatalogSync(startedAtIso, cooldownBefore)
    if (!claimed) {
        throw new CatalogSyncCooldownError()
    }

    const [normalHtml, hardHtml, introHtml] = await Promise.all([
        decodeBoundedResponse(CATALOG_SOURCE_URLS.normal),
        decodeBoundedResponse(CATALOG_SOURCE_URLS.hard),
        decodeBoundedResponse(CATALOG_SOURCE_URLS.intro),
    ])
    const catalog = parseCatalogSources(normalHtml, hardHtml, introHtml, new Date().toISOString())
    await writeCatalog(catalog)

    return catalog.source
}

let catalogSyncInFlight: Promise<CatalogSource> | undefined

export const syncCatalogFromSource = async () => {
    if (catalogSyncInFlight !== undefined) {
        return await catalogSyncInFlight
    }

    const pending = performCatalogSync()
    catalogSyncInFlight = pending

    try {
        return await pending
    } finally {
        if (catalogSyncInFlight === pending) {
            catalogSyncInFlight = undefined
        }
    }
}

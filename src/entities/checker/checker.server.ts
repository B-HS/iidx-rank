import 'server-only'
import { and, asc, eq, sql } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type { RecordInput } from '@entities/checker/checker.dto'
import { CheckerSchema, RecordInputSchema, RecordSchema } from '@entities/checker/checker.dto'
import { userRecordsTag } from '@shared/server/cache-tags'
import { catalogCharts } from '@shared/server/db/catalog-schema'
import { userRecord, userRecordRevision } from '@shared/server/db/checker-schema'
import { getDb } from '@shared/server/db/get-db'

const RECORD_CACHE_STALE_SECONDS = 60
const RECORD_CACHE_REVALIDATE_SECONDS = 60
const RECORD_CACHE_EXPIRE_SECONDS = 300

const getCheckerByRevision = async (userId: string, _revision: number) => {
    'use cache'

    cacheLife({
        stale: RECORD_CACHE_STALE_SECONDS,
        revalidate: RECORD_CACHE_REVALIDATE_SECONDS,
        expire: RECORD_CACHE_EXPIRE_SECONDS,
    })
    cacheTag(userRecordsTag(userId))

    const records = await getDb()
        .select({
            chartId: userRecord.chartId,
            lamp: userRecord.lamp,
            scoreGrade: userRecord.scoreGrade,
            memo: userRecord.memo,
            updatedAt: userRecord.updatedAt,
        })
        .from(userRecord)
        .where(eq(userRecord.userId, userId))
        .orderBy(asc(userRecord.chartId))

    return CheckerSchema.parse({ userId, records })
}

export const getChecker = async (userId: string) => {
    const validatedUserId = CheckerSchema.shape.userId.parse(userId)
    const revisions = await getDb()
        .select({ revision: userRecordRevision.revision })
        .from(userRecordRevision)
        .where(eq(userRecordRevision.userId, validatedUserId))
        .limit(1)
    const revision = revisions[0]?.revision ?? 0

    return await getCheckerByRevision(validatedUserId, revision)
}

export const upsertRecord = async (userId: string, input: RecordInput) => {
    const validatedUserId = CheckerSchema.shape.userId.parse(userId)
    const validatedInput = RecordInputSchema.parse(input)
    const database = getDb()
    const record = RecordSchema.parse({ ...validatedInput, memo: validatedInput.memo ?? '', updatedAt: new Date().toISOString() })

    return await database.transaction(async (transaction) => {
        const charts = await transaction
            .select({ id: catalogCharts.id })
            .from(catalogCharts)
            .where(and(eq(catalogCharts.id, validatedInput.chartId), eq(catalogCharts.isActive, true)))
            .limit(1)

        if (!charts[0]) return null

        const savedRecords = await transaction
            .insert(userRecord)
            .values({ userId: validatedUserId, ...record })
            .onConflictDoUpdate({
                target: [userRecord.userId, userRecord.chartId],
                set: {
                    lamp: record.lamp,
                    updatedAt: record.updatedAt,
                    ...(validatedInput.memo === undefined ? {} : { memo: record.memo }),
                    ...(validatedInput.scoreGrade === undefined ? {} : { scoreGrade: record.scoreGrade }),
                },
            })
            .returning({
                chartId: userRecord.chartId,
                lamp: userRecord.lamp,
                memo: userRecord.memo,
                scoreGrade: userRecord.scoreGrade,
                updatedAt: userRecord.updatedAt,
            })
        await transaction
            .insert(userRecordRevision)
            .values({ userId: validatedUserId, revision: 1 })
            .onConflictDoUpdate({
                target: userRecordRevision.userId,
                set: { revision: sql`${userRecordRevision.revision} + 1` },
            })

        return RecordSchema.parse(savedRecords[0])
    })
}

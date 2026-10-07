import 'server-only'
import { and, asc, eq, sql } from 'drizzle-orm'
import { cacheLife, cacheTag } from 'next/cache'
import type { Record as ChartRecord, RecordInput } from '@entities/checker/checker.dto'
import { CheckerSchema, RecordInputSchema, RecordSchema } from '@entities/checker/checker.dto'
import { NO_PLAY_LAMP } from '@entities/profile/profile.dto'
import { userRecordsTag } from '@shared/server/cache-tags'
import { catalogCharts } from '@shared/server/db/catalog-schema'
import { userRecord, userRecordHistory, userRecordRevision } from '@shared/server/db/checker-schema'
import { getDb } from '@shared/server/db/get-db'

const RECORD_CACHE_STALE_SECONDS = 60
const RECORD_CACHE_REVALIDATE_SECONDS = 60
const RECORD_CACHE_EXPIRE_SECONDS = 300
const MANUAL_RECORD_SOURCE = 'manual' satisfies ChartRecord['source']

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
            exScore: userRecord.exScore,
            missCount: userRecord.missCount,
            source: userRecord.source,
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

type RecordTransaction = Parameters<Parameters<ReturnType<typeof getDb>['transaction']>[0]>[0]

export const incrementRecordRevision = async (transaction: RecordTransaction, userId: string, updatedAt: string) => {
    await transaction
        .insert(userRecordRevision)
        .values({ userId, revision: 1, updatedAt })
        .onConflictDoUpdate({
            target: userRecordRevision.userId,
            set: { revision: sql`${userRecordRevision.revision} + 1`, updatedAt },
        })
}

export const upsertRecord = async (userId: string, input: RecordInput) => {
    const validatedUserId = CheckerSchema.shape.userId.parse(userId)
    const validatedInput = RecordInputSchema.parse(input)
    const database = getDb()
    const updatedAt = new Date().toISOString()

    return await database.transaction(async (transaction) => {
        const charts = await transaction
            .select({ id: catalogCharts.id })
            .from(catalogCharts)
            .where(and(eq(catalogCharts.id, validatedInput.chartId), eq(catalogCharts.isActive, true)))
            .limit(1)

        if (!charts[0]) return null

        const currentRecords = await transaction
            .select({ lamp: userRecord.lamp, scoreGrade: userRecord.scoreGrade })
            .from(userRecord)
            .where(and(eq(userRecord.userId, validatedUserId), eq(userRecord.chartId, validatedInput.chartId)))
            .limit(1)
        const currentLamp = currentRecords[0]?.lamp ?? NO_PLAY_LAMP
        const currentScoreGrade = currentRecords[0]?.scoreGrade ?? null
        const scoreGrade = validatedInput.scoreGrade === undefined ? currentScoreGrade : validatedInput.scoreGrade
        const isResultChanged = currentLamp !== validatedInput.lamp || currentScoreGrade !== scoreGrade
        const savedRecords = await transaction
            .insert(userRecord)
            .values({
                userId: validatedUserId,
                chartId: validatedInput.chartId,
                lamp: validatedInput.lamp,
                scoreGrade,
                memo: validatedInput.memo,
                source: MANUAL_RECORD_SOURCE,
                updatedAt,
            })
            .onConflictDoUpdate({
                target: [userRecord.userId, userRecord.chartId],
                set: {
                    lamp: validatedInput.lamp,
                    updatedAt,
                    ...(validatedInput.memo === undefined ? {} : { memo: validatedInput.memo }),
                    ...(validatedInput.scoreGrade === undefined ? {} : { scoreGrade }),
                    ...(isResultChanged ? { source: MANUAL_RECORD_SOURCE } : {}),
                },
            })
            .returning({
                chartId: userRecord.chartId,
                lamp: userRecord.lamp,
                memo: userRecord.memo,
                scoreGrade: userRecord.scoreGrade,
                exScore: userRecord.exScore,
                missCount: userRecord.missCount,
                source: userRecord.source,
                updatedAt: userRecord.updatedAt,
            })
        const savedRecord = RecordSchema.parse(savedRecords[0])

        if (isResultChanged) {
            await transaction.insert(userRecordHistory).values({
                userId: validatedUserId,
                chartId: savedRecord.chartId,
                lamp: savedRecord.lamp,
                scoreGrade: savedRecord.scoreGrade,
                exScore: savedRecord.exScore,
                missCount: savedRecord.missCount,
                source: MANUAL_RECORD_SOURCE,
                recordedAt: updatedAt,
            })
        }

        await incrementRecordRevision(transaction, validatedUserId, updatedAt)

        return savedRecord
    })
}

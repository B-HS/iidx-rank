import { describe, expect, test } from 'bun:test'
import {
    HandoffScreenMessageSchema,
    parseHandoffPayload,
    readHandoffMessage,
    sendHandoffReady,
    sendHandoffResult,
} from '@entities/eamusement/eamusement-handoff'
import { ImportResultSchema } from '@entities/eamusement/eamusement.dto'

const SITE_ORIGIN = 'https://iidx.hyns.dev'
const HANDOFF_ID = '5f0c1a52-7c3e-4d7f-9a53-2f8f4e6b1c90'
const VALID_PAYLOAD = {
    version: 2,
    kind: 'iidx-rank-import',
    generatedAt: '2026-10-07T10:05:00.000Z',
    gameVersion: 34,
    style: 0,
    player: null,
    notesRadar: null,
    charts: [
        {
            chartId: 'chart-6d4d8c5dd256f3870c3527063b541f01',
            title: '冥',
            difficulty: 'A',
            level: 12,
            lamp: 'FULL_COMBO',
            scoreGrade: 'AAA',
            exScore: 3123,
            missCount: null,
        },
    ],
}
const IMPORT_RESULT = ImportResultSchema.parse({
    importId: 12,
    channel: 'extension',
    importedAt: '2026-10-07T10:05:03.000Z',
    receivedCount: 1,
    matchedCount: 1,
    changedCount: 1,
    changes: [{ chartId: 'chart-6d4d8c5dd256f3870c3527063b541f01', previousLamp: null, lamp: 'FULL_COMBO', scoreGrade: 'AAA', exScore: 3123 }],
    unmatched: [],
})

const createTarget = (origin = SITE_ORIGIN) => {
    const posted: { message: unknown; targetOrigin: string }[] = []

    return {
        posted,
        target: {
            location: { origin },
            postMessage: (message: unknown, targetOrigin: string) => {
                posted.push({ message, targetOrigin })
            },
        },
    }
}

const createEvent = (target: unknown, data: unknown, origin = SITE_ORIGIN) => ({ source: target, origin, data })

describe('익스텐션 반영 메시지 수신', () => {
    test('같은 window가 같은 출처로 보낸 hello·payload·none을 받아들입니다', () => {
        const { target } = createTarget()

        expect(readHandoffMessage(createEvent(target, { channel: 'iidx-rank-import', type: 'hello' }), target)).toEqual({
            channel: 'iidx-rank-import',
            type: 'hello',
        })
        expect(readHandoffMessage(createEvent(target, { channel: 'iidx-rank-import', type: 'none' }), target)).toEqual({
            channel: 'iidx-rank-import',
            type: 'none',
        })
        expect(
            readHandoffMessage(
                createEvent(target, { channel: 'iidx-rank-import', type: 'payload', handoffId: HANDOFF_ID, payload: VALID_PAYLOAD }),
                target,
            ),
        ).toEqual({ channel: 'iidx-rank-import', type: 'payload', handoffId: HANDOFF_ID, payload: VALID_PAYLOAD })
    })
    test('본문이 잘못된 payload 메시지도 받아들여 화면이 실패를 보고할 수 있게 합니다', () => {
        const { target } = createTarget()
        const message = readHandoffMessage(
            createEvent(target, { channel: 'iidx-rank-import', type: 'payload', handoffId: HANDOFF_ID, payload: { version: 1 } }),
            target,
        )

        expect(message).toEqual({ channel: 'iidx-rank-import', type: 'payload', handoffId: HANDOFF_ID, payload: { version: 1 } })
    })
    test('다른 window나 다른 출처에서 온 메시지는 무시합니다', () => {
        const { target } = createTarget()
        const { target: otherTarget } = createTarget()
        const data = { channel: 'iidx-rank-import', type: 'hello' }

        expect(readHandoffMessage(createEvent(otherTarget, data), target)).toBeNull()
        expect(readHandoffMessage(createEvent(null, data), target)).toBeNull()
        expect(readHandoffMessage(createEvent(target, data, 'https://example.com'), target)).toBeNull()
    })
    test('channel이 다르거나 형식이 맞지 않는 메시지는 무시합니다', () => {
        const { target } = createTarget()
        const ignoredData = [
            null,
            'hello',
            { type: 'hello' },
            { channel: 'other-channel', type: 'hello' },
            { channel: 'iidx-rank-import', type: 'unknown' },
            { channel: 'iidx-rank-import', type: 'payload', payload: VALID_PAYLOAD },
            { channel: 'iidx-rank-import', type: 'payload', handoffId: 1, payload: VALID_PAYLOAD },
        ]

        for (const data of ignoredData) expect(readHandoffMessage(createEvent(target, data), target)).toBeNull()
    })
    test('화면이 보낸 ready·result가 자기 리스너로 돌아와도 무시합니다', () => {
        const { target, posted } = createTarget()

        sendHandoffReady(target)
        sendHandoffResult(target, HANDOFF_ID, { status: 'failed', code: 'REQUEST_FAILED' })

        expect(posted).toHaveLength(2)

        for (const { message } of posted) expect(readHandoffMessage(createEvent(target, message), target)).toBeNull()
    })
})

describe('익스텐션 반영 메시지 송신', () => {
    test('ready를 자기 출처로만 보냅니다', () => {
        const { target, posted } = createTarget()

        sendHandoffReady(target)

        expect(posted).toEqual([{ message: { channel: 'iidx-rank-import', type: 'ready' }, targetOrigin: SITE_ORIGIN }])
    })
    test('성공 결과를 handoffId와 가져오기 응답과 함께 보냅니다', () => {
        const { target, posted } = createTarget()

        sendHandoffResult(target, HANDOFF_ID, { status: 'success', result: IMPORT_RESULT })

        expect(posted).toEqual([
            {
                message: {
                    channel: 'iidx-rank-import',
                    type: 'result',
                    handoffId: HANDOFF_ID,
                    outcome: { status: 'success', result: IMPORT_RESULT },
                },
                targetOrigin: SITE_ORIGIN,
            },
        ])
        expect(HandoffScreenMessageSchema.safeParse(posted[0].message).success).toBe(true)
    })
    test('실패 결과를 오류 코드와 함께 보냅니다', () => {
        const { target, posted } = createTarget()

        sendHandoffResult(target, HANDOFF_ID, { status: 'failed', code: 'IMPORT_COOLDOWN' })

        expect(posted).toEqual([
            {
                message: {
                    channel: 'iidx-rank-import',
                    type: 'result',
                    handoffId: HANDOFF_ID,
                    outcome: { status: 'failed', code: 'IMPORT_COOLDOWN' },
                },
                targetOrigin: SITE_ORIGIN,
            },
        ])
        expect(HandoffScreenMessageSchema.safeParse(posted[0].message).success).toBe(true)
    })
})

describe('넘겨받은 본문 검증', () => {
    test('rank-import v2 SP 본문을 통과시킵니다', () => {
        expect<unknown>(parseHandoffPayload(VALID_PAYLOAD)).toEqual({ status: 'VALID', input: VALID_PAYLOAD })
    })
    test('스키마에 맞지 않는 본문은 INVALID_PAYLOAD입니다', () => {
        const invalidPayloads = [undefined, null, 'text', {}, { ...VALID_PAYLOAD, version: 1 }, { ...VALID_PAYLOAD, userId: 'someone' }]

        for (const payload of invalidPayloads) expect(parseHandoffPayload(payload)).toEqual({ status: 'INVALID_PAYLOAD' })
    })
    test('DP 본문은 업로드하지 않도록 UNSUPPORTED_STYLE로 구분합니다', () => {
        expect(parseHandoffPayload({ ...VALID_PAYLOAD, style: 1 })).toEqual({ status: 'UNSUPPORTED_STYLE' })
    })
})

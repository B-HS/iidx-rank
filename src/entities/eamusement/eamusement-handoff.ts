import { z } from 'zod'
import { ImportInputSchema, ImportResultSchema } from '@entities/eamusement/eamusement.dto'
import { IMPORT_HANDOFF_CHANNEL, IMPORT_STYLE } from '@shared/constants/eamusement'

type HandoffWindow = {
    location: Pick<Location, 'origin'>
    postMessage: (message: unknown, targetOrigin: string) => void
}

type HandoffEvent = Pick<MessageEvent<unknown>, 'origin' | 'data'> & { source: unknown }

const HandoffEnvelopeSchema = z.object({ channel: z.literal(IMPORT_HANDOFF_CHANNEL) })
const HandoffIdSchema = z.string()

export const HandoffOutcomeSchema = z.discriminatedUnion('status', [
    z.object({ status: z.literal('success'), result: ImportResultSchema }),
    z.object({ status: z.literal('failed'), code: z.string() }),
])
export type HandoffOutcome = z.infer<typeof HandoffOutcomeSchema>

export const HandoffExtensionMessageSchema = z.discriminatedUnion('type', [
    HandoffEnvelopeSchema.extend({ type: z.literal('hello') }),
    HandoffEnvelopeSchema.extend({ type: z.literal('payload'), handoffId: HandoffIdSchema, payload: z.unknown() }),
    HandoffEnvelopeSchema.extend({ type: z.literal('none') }),
])
export type HandoffExtensionMessage = z.infer<typeof HandoffExtensionMessageSchema>

export const HandoffScreenMessageSchema = z.discriminatedUnion('type', [
    HandoffEnvelopeSchema.extend({ type: z.literal('ready') }),
    HandoffEnvelopeSchema.extend({ type: z.literal('result'), handoffId: HandoffIdSchema, outcome: HandoffOutcomeSchema }),
])
export type HandoffScreenMessage = z.infer<typeof HandoffScreenMessageSchema>

const postHandoffMessage = (target: HandoffWindow, message: HandoffScreenMessage) => target.postMessage(message, target.location.origin)

/**
 * Tells the extension content script that the screen can receive a payload.
 * @param target - the window that both sides share
 */
export const sendHandoffReady = (target: HandoffWindow) => postHandoffMessage(target, { channel: IMPORT_HANDOFF_CHANNEL, type: 'ready' })

/**
 * Reports the upload outcome of one handoff back to the extension content script.
 * @param target - the window that both sides share
 * @param handoffId - id of the handoff the outcome belongs to
 * @param outcome - the import result, or the failure code
 */
export const sendHandoffResult = (target: HandoffWindow, handoffId: string, outcome: HandoffOutcome) =>
    postHandoffMessage(target, { channel: IMPORT_HANDOFF_CHANNEL, type: 'result', handoffId, outcome })

/**
 * Accepts only messages that this window posted to its own origin and that match the extension side of the contract.
 * @param event - the received message event
 * @param target - the window the listener is attached to
 * @returns the validated message, or null when the event must be ignored
 */
export const readHandoffMessage = (event: HandoffEvent, target: HandoffWindow) => {
    if (event.source !== target || event.origin !== target.location.origin) return null

    const message = HandoffExtensionMessageSchema.safeParse(event.data)

    return message.success ? message.data : null
}

/**
 * Validates a handed-off body as rank-import v2. The failure statuses double as the outcome codes reported to the extension.
 * @param payload - untrusted body received from the extension
 */
export const parseHandoffPayload = (payload: unknown) => {
    const input = ImportInputSchema.safeParse(payload)

    if (!input.success) return { status: 'INVALID_PAYLOAD' } as const
    if (input.data.style !== IMPORT_STYLE.SP) return { status: 'UNSUPPORTED_STYLE' } as const

    return { status: 'VALID', input: input.data } as const
}

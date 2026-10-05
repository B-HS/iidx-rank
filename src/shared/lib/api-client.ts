import { z } from 'zod'

import { MESSAGES } from '@shared/messages/messages'

const ApiErrorEnvelopeSchema = z.object({
    success: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
})

const ApiSuccessEnvelopeSchema = z.object({
    success: z.literal(true),
    data: z.unknown(),
})

export const apiRequest = async <Output>(endpoint: string, dataSchema: z.ZodType<Output>, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body !== undefined && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    let response: Response
    let payload: unknown

    try {
        response = await fetch(endpoint, { ...init, cache: 'no-store', credentials: 'same-origin', headers })
        payload = await response.json()
    } catch {
        throw new Error(MESSAGES.common.unknownError)
    }

    const errorEnvelope = ApiErrorEnvelopeSchema.safeParse(payload)

    if (errorEnvelope.success) {
        throw new Error(errorEnvelope.data.error.message)
    }

    const successEnvelope = ApiSuccessEnvelopeSchema.safeParse(payload)

    if (!successEnvelope.success || !response.ok) {
        throw new Error(MESSAGES.common.unknownError)
    }

    const parsedData = dataSchema.safeParse(successEnvelope.data.data)

    if (!parsedData.success) {
        throw new Error(MESSAGES.common.unknownError)
    }

    return parsedData.data
}

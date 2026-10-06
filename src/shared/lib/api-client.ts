import { z } from 'zod'

const ApiErrorEnvelopeSchema = z.object({
    success: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
})

const ApiSuccessEnvelopeSchema = z.object({
    success: z.literal(true),
    data: z.unknown(),
})

const ApiErrorCauseSchema = z.object({ code: z.string() })

export const API_REQUEST_FAILED_CODE = 'REQUEST_FAILED'

const createRequestFailedError = () => new Error(API_REQUEST_FAILED_CODE, { cause: { code: API_REQUEST_FAILED_CODE } })

export const getApiErrorCode = (error: unknown) => {
    if (!(error instanceof Error)) return API_REQUEST_FAILED_CODE

    const cause = ApiErrorCauseSchema.safeParse(error.cause)

    return cause.success ? cause.data.code : API_REQUEST_FAILED_CODE
}

export const apiRequest = async <Output>(endpoint: string, dataSchema: z.ZodType<Output>, init: RequestInit = {}) => {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body !== undefined && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    let response: Response
    let payload: unknown

    try {
        response = await fetch(endpoint, { ...init, cache: 'no-store', credentials: 'same-origin', headers })
        payload = await response.json()
    } catch {
        throw createRequestFailedError()
    }

    const errorEnvelope = ApiErrorEnvelopeSchema.safeParse(payload)

    if (errorEnvelope.success) {
        throw new Error(errorEnvelope.data.error.message, { cause: { code: errorEnvelope.data.error.code } })
    }

    const successEnvelope = ApiSuccessEnvelopeSchema.safeParse(payload)

    if (!successEnvelope.success || !response.ok) {
        throw createRequestFailedError()
    }

    const parsedData = dataSchema.safeParse(successEnvelope.data.data)

    if (!parsedData.success) {
        throw createRequestFailedError()
    }

    return parsedData.data
}

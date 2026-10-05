import { CheckerSchema, RecordInputSchema, RecordSchema, type RecordInput } from '@entities/checker/checker.dto'
import { apiRequest } from '@shared/lib/api-client'

export const fetchChecker = () => apiRequest('/api/records', CheckerSchema)

export const saveRecord = (input: RecordInput) => {
    const validatedInput = RecordInputSchema.parse(input)

    return apiRequest('/api/records', RecordSchema, {
        method: 'PATCH',
        body: JSON.stringify(validatedInput),
    })
}

export const refreshChecker = () => apiRequest('/api/cache/refresh', CheckerSchema, { method: 'POST' })

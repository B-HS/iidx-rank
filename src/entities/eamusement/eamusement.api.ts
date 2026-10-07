import { ImportInputSchema, ImportResultSchema, ImportStatusResponseSchema, type ImportInput } from '@entities/eamusement/eamusement.dto'
import { apiRequest } from '@shared/lib/api-client'

export const fetchImportStatus = () => apiRequest('/api/import/status', ImportStatusResponseSchema)

export const postImportRecords = (input: ImportInput) =>
    apiRequest('/api/import/records', ImportResultSchema, { method: 'POST', body: JSON.stringify(ImportInputSchema.parse(input)) })

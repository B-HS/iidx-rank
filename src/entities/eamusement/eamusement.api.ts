import {
    type ImportChannel,
    ImportInputSchema,
    ImportResultSchema,
    ImportStatusResponseSchema,
    type ImportInput,
} from '@entities/eamusement/eamusement.dto'
import { IMPORT_CHANNEL_HEADER } from '@shared/constants/eamusement'
import { apiRequest } from '@shared/lib/api-client'

export const fetchImportStatus = () => apiRequest('/api/import/status', ImportStatusResponseSchema)

export const postImportRecords = (input: ImportInput, channelHint?: ImportChannel) =>
    apiRequest('/api/import/records', ImportResultSchema, {
        method: 'POST',
        headers: channelHint ? { [IMPORT_CHANNEL_HEADER]: channelHint } : undefined,
        body: JSON.stringify(ImportInputSchema.parse(input)),
    })

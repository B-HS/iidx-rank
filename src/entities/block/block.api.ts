import { BlockListSchema } from '@entities/block/block.dto'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { apiRequest } from '@shared/lib/api-client'

const getBlockEndpoint = (handle: string) => `/api/blocks/${HandleSchema.parse(handle)}`

export const fetchBlockList = () => apiRequest('/api/blocks', BlockListSchema)

export const blockUser = (handle: string) => apiRequest(getBlockEndpoint(handle), BlockListSchema, { method: 'PUT' })

export const unblockUser = (handle: string) => apiRequest(getBlockEndpoint(handle), BlockListSchema, { method: 'DELETE' })

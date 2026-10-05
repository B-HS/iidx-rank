import { CatalogSchema, CatalogSyncResultSchema } from '@entities/catalog/catalog.dto'
import { apiRequest } from '@shared/lib/api-client'

export const fetchCatalog = () => apiRequest('/api/catalog', CatalogSchema)

export const syncCatalog = () => apiRequest('/api/catalog/sync', CatalogSyncResultSchema, { method: 'POST' })

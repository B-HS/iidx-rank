import { DisplayPreferencesSchema, DisplayPreferencesInputSchema, type DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { apiRequest } from '@shared/lib/api-client'
export const fetchDisplayPreferences = () => apiRequest('/api/preferences/display', DisplayPreferencesSchema)
export const updateDisplayPreferences = (input: DisplayPreferencesInput) =>
    apiRequest('/api/preferences/display', DisplayPreferencesSchema, {
        method: 'PATCH',
        body: JSON.stringify(DisplayPreferencesInputSchema.parse(input)),
    })

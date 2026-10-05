import { DisplayPreferencesInputSchema } from '@entities/preferences/preferences.dto'
import { ANONYMOUS_PREFERENCES_MAX_LENGTH } from '@shared/constants/display'

export const parseAnonymousPreferences = (value: string | undefined | null) => {
    if (!value || value.length > ANONYMOUS_PREFERENCES_MAX_LENGTH) return null
    try {
        const parsed = DisplayPreferencesInputSchema.safeParse(JSON.parse(value))
        return parsed.success ? parsed.data : null
    } catch {
        return null
    }
}

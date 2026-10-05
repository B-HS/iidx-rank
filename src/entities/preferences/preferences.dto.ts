import { z } from 'zod'
import { VERSION_DISPLAYS, MIN_LOGO_OPACITY, MAX_LOGO_OPACITY } from '@shared/constants/display'

export const DisplayPreferencesInputSchema = z.strictObject({
    versionDisplay: z.enum(VERSION_DISPLAYS),
    logoOpacity: z.number().int().min(MIN_LOGO_OPACITY).max(MAX_LOGO_OPACITY),
})
export type DisplayPreferencesInput = z.infer<typeof DisplayPreferencesInputSchema>
export const DisplayPreferencesSchema = z.object({ userId: z.uuid(), preferences: DisplayPreferencesInputSchema })
export type DisplayPreferences = z.infer<typeof DisplayPreferencesSchema>

export const VERSION_DISPLAYS = ['logo', 'title'] as const
export const DEFAULT_LOGO_OPACITY = 10
export const MIN_LOGO_OPACITY = 0
export const MAX_LOGO_OPACITY = 100
export const LOGO_OPACITY_STEP = 5
export const DEFAULT_DISPLAY_PREFERENCES = { versionDisplay: VERSION_DISPLAYS[0], logoOpacity: DEFAULT_LOGO_OPACITY }
export const PREFERENCES_CACHE_STALE_SECONDS = 60
export const PREFERENCES_CACHE_REVALIDATE_SECONDS = 60
export const PREFERENCES_CACHE_EXPIRE_SECONDS = 300

export const ANONYMOUS_PREFERENCES_STORAGE_KEY = 'iidx:anonymous-display:v1'
export const ANONYMOUS_PREFERENCES_COOKIE_NAME = 'iidx-anonymous-display'
export const ANONYMOUS_PREFERENCES_CHANGE_EVENT = 'iidx-anonymous-display-change'
export const ANONYMOUS_PREFERENCES_MAX_AGE_SECONDS = 31_536_000
export const ANONYMOUS_PREFERENCES_MAX_LENGTH = 256
export const CHART_CARD_BODY_CLASS_NAMES = { logo: 'h-10 min-h-10', title: 'h-14 min-h-14' } as const

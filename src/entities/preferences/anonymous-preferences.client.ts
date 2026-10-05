'use client'

import { useSyncExternalStore } from 'react'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { DisplayPreferencesInputSchema } from '@entities/preferences/preferences.dto'
import { parseAnonymousPreferences } from '@entities/preferences/anonymous-preferences.dto'
import {
    ANONYMOUS_PREFERENCES_STORAGE_KEY,
    ANONYMOUS_PREFERENCES_COOKIE_NAME,
    ANONYMOUS_PREFERENCES_CHANGE_EVENT,
    ANONYMOUS_PREFERENCES_MAX_AGE_SECONDS,
    DEFAULT_DISPLAY_PREFERENCES,
} from '@shared/constants/display'

const readCookieSnapshot = () => {
    try {
        const prefix = ANONYMOUS_PREFERENCES_COOKIE_NAME + '='
        const cookie = document.cookie.split('; ').find((item) => item.startsWith(prefix))
        return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null
    } catch {
        return null
    }
}
const readBrowserSnapshot = () => {
    const cookie = readCookieSnapshot()
    if (parseAnonymousPreferences(cookie)) return cookie
    try {
        const stored = localStorage.getItem(ANONYMOUS_PREFERENCES_STORAGE_KEY)
        if (parseAnonymousPreferences(stored)) return stored
    } catch {
        return readCookieSnapshot()
    }
    return readCookieSnapshot()
}
const subscribe = (onChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === ANONYMOUS_PREFERENCES_STORAGE_KEY || event.key === null) onChange()
    }
    window.addEventListener('storage', handleStorage)
    window.addEventListener(ANONYMOUS_PREFERENCES_CHANGE_EVENT, onChange)
    return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(ANONYMOUS_PREFERENCES_CHANGE_EVENT, onChange)
    }
}
const subscribeHydration = () => () => undefined
const getHydratedSnapshot = () => true
const getServerHydratedSnapshot = () => false

export const useAnonymousPreferences = (initialPreferences: DisplayPreferencesInput | null) => {
    const initialSnapshot = initialPreferences ? JSON.stringify(initialPreferences) : null
    const snapshot = useSyncExternalStore(subscribe, readBrowserSnapshot, () => initialSnapshot)
    const isHydrated = useSyncExternalStore(subscribeHydration, getHydratedSnapshot, getServerHydratedSnapshot)
    return { preferences: parseAnonymousPreferences(snapshot) ?? DEFAULT_DISPLAY_PREFERENCES, isReady: initialPreferences !== null || isHydrated }
}
export const saveAnonymousPreferences = (input: DisplayPreferencesInput) => {
    const value = JSON.stringify(DisplayPreferencesInputSchema.parse(input))
    let isStored = false
    try {
        localStorage.setItem(ANONYMOUS_PREFERENCES_STORAGE_KEY, value)
        isStored = true
    } catch {
        isStored = false
    }
    try {
        document.cookie =
            ANONYMOUS_PREFERENCES_COOKIE_NAME +
            '=' +
            encodeURIComponent(value) +
            '; Path=/; SameSite=Lax; Max-Age=' +
            ANONYMOUS_PREFERENCES_MAX_AGE_SECONDS +
            (location.protocol === 'https:' ? '; Secure' : '')
        isStored = isStored || readCookieSnapshot() === value
    } catch {
        window.dispatchEvent(new Event(ANONYMOUS_PREFERENCES_CHANGE_EVENT))
        return isStored
    }
    window.dispatchEvent(new Event(ANONYMOUS_PREFERENCES_CHANGE_EVENT))
    return isStored
}

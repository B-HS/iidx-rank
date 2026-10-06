'use client'

import { useSyncExternalStore } from 'react'
import {
    CHECKER_TOUCH_HINT_CHANGE_EVENT,
    CHECKER_TOUCH_HINT_DISMISSED_VALUE,
    CHECKER_TOUCH_HINT_STORAGE_KEY,
    COARSE_POINTER_MEDIA_QUERY,
} from '@shared/constants/checker'

let isDismissedInSession = false

const readIsDismissed = () => {
    if (isDismissedInSession) return true
    try {
        return localStorage.getItem(CHECKER_TOUCH_HINT_STORAGE_KEY) === CHECKER_TOUCH_HINT_DISMISSED_VALUE
    } catch {
        return false
    }
}
const subscribe = (onChange: () => void) => {
    const coarsePointerQuery = window.matchMedia(COARSE_POINTER_MEDIA_QUERY)
    const handleStorage = (event: StorageEvent) => {
        if (event.key === CHECKER_TOUCH_HINT_STORAGE_KEY || event.key === null) onChange()
    }
    coarsePointerQuery.addEventListener('change', onChange)
    window.addEventListener('storage', handleStorage)
    window.addEventListener(CHECKER_TOUCH_HINT_CHANGE_EVENT, onChange)
    return () => {
        coarsePointerQuery.removeEventListener('change', onChange)
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(CHECKER_TOUCH_HINT_CHANGE_EVENT, onChange)
    }
}
const getSnapshot = () => window.matchMedia(COARSE_POINTER_MEDIA_QUERY).matches && !readIsDismissed()
const getServerSnapshot = () => false

export const useIsCheckerTouchHintVisible = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
export const dismissCheckerTouchHint = () => {
    try {
        localStorage.setItem(CHECKER_TOUCH_HINT_STORAGE_KEY, CHECKER_TOUCH_HINT_DISMISSED_VALUE)
    } catch {
        isDismissedInSession = true
    }
    window.dispatchEvent(new Event(CHECKER_TOUCH_HINT_CHANGE_EVENT))
}

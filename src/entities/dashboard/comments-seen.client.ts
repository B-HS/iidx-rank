'use client'
import { useSyncExternalStore } from 'react'
import { type CommentsSeen, CommentsSeenSchema, parseCommentsSeen } from '@entities/dashboard/comments-seen.dto'
import { DASHBOARD_COMMENTS_SEEN_CHANGE_EVENT, DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX } from '@shared/constants/dashboard'

let sessionSnapshots: Readonly<Record<string, string>> = {}

const getStorageKey = (userId: string) => DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX + userId

const readSnapshot = (userId: string) => {
    const key = getStorageKey(userId)
    const sessionSnapshot = sessionSnapshots[key] ?? null

    if (sessionSnapshot !== null) return sessionSnapshot

    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

const subscribe = (onChange: () => void) => {
    const handleStorage = (event: StorageEvent) => {
        if (event.key === null || event.key.startsWith(DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX)) onChange()
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(DASHBOARD_COMMENTS_SEEN_CHANGE_EVENT, onChange)

    return () => {
        window.removeEventListener('storage', handleStorage)
        window.removeEventListener(DASHBOARD_COMMENTS_SEEN_CHANGE_EVENT, onChange)
    }
}

const getServerSnapshot = () => null

export const useCommentsSeen = (userId: string) => parseCommentsSeen(useSyncExternalStore(subscribe, () => readSnapshot(userId), getServerSnapshot))

export const saveCommentsSeen = (userId: string, seen: CommentsSeen) => {
    const key = getStorageKey(userId)
    const value = JSON.stringify(CommentsSeenSchema.parse(seen))

    try {
        localStorage.setItem(key, value)
    } catch {
        sessionSnapshots = { ...sessionSnapshots, [key]: value }
    }

    window.dispatchEvent(new Event(DASHBOARD_COMMENTS_SEEN_CHANGE_EVENT))
}

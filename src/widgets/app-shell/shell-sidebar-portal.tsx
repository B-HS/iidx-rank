'use client'
import { type FC, type PropsWithChildren, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { useShellSidebarSlot } from '@shared/hooks/use-shell-sidebar-slot'
const subscribeToHydration = () => () => undefined
const getHydratedSnapshot = () => true
const getHydratingSnapshot = () => false
export const ShellSidebarPortal: FC<PropsWithChildren> = ({ children }) => {
    const { element } = useShellSidebarSlot()
    const isHydrated = useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getHydratingSnapshot)
    if (!isHydrated || !element) return null
    return createPortal(children, element)
}

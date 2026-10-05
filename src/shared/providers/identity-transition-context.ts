import { createContext } from 'react'

export type IdentityTransitionContextValue = {
    isPending: boolean
    previousUserId: string | null
    begin: (userId: string | null) => void
    end: () => void
}

export const IdentityTransitionContext = createContext<IdentityTransitionContextValue | null>(null)

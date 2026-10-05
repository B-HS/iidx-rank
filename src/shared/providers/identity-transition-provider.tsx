'use client'

import { type FC, type PropsWithChildren, useState } from 'react'

import { IdentityTransitionContext } from '@shared/providers/identity-transition-context'

export const IdentityTransitionProvider: FC<PropsWithChildren> = ({ children }) => {
    const [isPending, setIsPending] = useState(false)
    const [previousUserId, setPreviousUserId] = useState<string | null>(null)
    const contextValue = {
        isPending,
        previousUserId,
        begin: (userId: string | null) => {
            setPreviousUserId(userId)
            setIsPending(true)
        },
        end: () => {
            setPreviousUserId(null)
            setIsPending(false)
        },
    }

    return <IdentityTransitionContext.Provider value={contextValue}>{children}</IdentityTransitionContext.Provider>
}

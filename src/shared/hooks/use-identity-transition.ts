'use client'

import { useContext } from 'react'

import { IdentityTransitionContext } from '@shared/providers/identity-transition-context'

export const useIdentityTransition = () => {
    const context = useContext(IdentityTransitionContext)

    if (!context) {
        throw new Error('IdentityTransitionProvider is missing.')
    }

    return context
}

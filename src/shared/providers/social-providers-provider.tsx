'use client'

import type { FC, PropsWithChildren } from 'react'
import type { SocialProvider } from '@shared/constants/auth'
import { SocialProvidersContext } from '@shared/providers/social-providers-context'

type SocialProvidersProviderProps = PropsWithChildren<{
    providers: readonly SocialProvider[]
}>

export const SocialProvidersProvider: FC<SocialProvidersProviderProps> = ({ providers, children }) => (
    <SocialProvidersContext.Provider value={providers}>{children}</SocialProvidersContext.Provider>
)

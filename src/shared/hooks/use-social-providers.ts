'use client'

import { useContext } from 'react'

import { SocialProvidersContext } from '@shared/providers/social-providers-context'

export const useSocialProviders = () => useContext(SocialProvidersContext)

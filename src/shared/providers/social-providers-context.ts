import { createContext } from 'react'
import type { SocialProvider } from '@shared/constants/auth'

export const SocialProvidersContext = createContext<readonly SocialProvider[]>([])

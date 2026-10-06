import type { UserSummary } from '@entities/profile/user-summary.dto'

export const getProfilePathname = (handle: string) => `/u/${handle}`

export const getProfilePageTitle = ({ name, handle }: Pick<UserSummary, 'name' | 'handle'>) => `${name} (@${handle})`

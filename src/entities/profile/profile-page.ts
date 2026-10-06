import type { UserSummary } from '@entities/profile/user-summary.dto'

export const getProfilePathname = (handle: string) => `/u/${handle}`

export const getProfilePageTitle = ({ name, handle }: Pick<UserSummary, 'name' | 'handle'>) => `${name} (@${handle})`

export const USERS_PATHNAME = '/users'
const FIRST_PAGE = 1

export const getUserListPathname = (page: number) => (page > FIRST_PAGE ? `${USERS_PATHNAME}?page=${page}` : USERS_PATHNAME)

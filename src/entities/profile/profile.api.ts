import {
    MyProfileSchema,
    ProfileRecordsSchema,
    ProfileSchema,
    ProfileUpdateInputSchema,
    RecentUsersSchema,
    type ProfileUpdateInput,
} from '@entities/profile/profile.dto'
import { apiRequest } from '@shared/lib/api-client'

const profileEndpoint = (handle: string) => `/api/profiles/${encodeURIComponent(handle)}`

export const fetchMyProfile = () => apiRequest('/api/profiles/me', MyProfileSchema)

export const updateMyProfile = (input: ProfileUpdateInput) =>
    apiRequest('/api/profiles/me', MyProfileSchema, { method: 'PATCH', body: JSON.stringify(ProfileUpdateInputSchema.parse(input)) })

export const fetchProfile = (handle: string) => apiRequest(profileEndpoint(handle), ProfileSchema)

export const fetchProfileRecords = (handle: string) => apiRequest(`${profileEndpoint(handle)}/records`, ProfileRecordsSchema)

export const followProfile = (handle: string) => apiRequest(`${profileEndpoint(handle)}/follow`, ProfileSchema, { method: 'PUT' })

export const unfollowProfile = (handle: string) => apiRequest(`${profileEndpoint(handle)}/follow`, ProfileSchema, { method: 'DELETE' })

export const fetchRecentUsers = () => apiRequest('/api/users/recent', RecentUsersSchema)

'use client'
import { authClient } from '@entities/auth/auth.api'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'

export const useViewerIdentity = (initialUserId: string | null) => {
    const identityTransition = useIdentityTransition()
    const { data: session, isPending: isSessionPending } = authClient.useSession()
    const sessionUserId = session?.user.id ?? null

    return {
        isAligned: !identityTransition.isPending && (isSessionPending || sessionUserId === initialUserId),
        viewerId: isSessionPending ? initialUserId : sessionUserId,
    }
}

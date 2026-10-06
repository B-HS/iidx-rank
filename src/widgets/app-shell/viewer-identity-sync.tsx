'use client'
import { type FC, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { authClient } from '@entities/auth/auth.api'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'

type ViewerIdentitySyncProps = {
    initialUserId: string | null
}

export const ViewerIdentitySync: FC<ViewerIdentitySyncProps> = ({ initialUserId }) => {
    const previousUserId = useRef(initialUserId)
    const queryClient = useQueryClient()
    const router = useRouter()
    const identityTransition = useIdentityTransition()
    const { data: session, isPending: isSessionPending } = authClient.useSession()

    useEffect(() => {
        const userId = session?.user.id ?? null
        if (isSessionPending) {
            return
        }
        if (previousUserId.current !== userId) {
            previousUserId.current = userId
            queryClient.clear()
            router.refresh()
        }
        if (identityTransition.isPending && userId !== identityTransition.previousUserId && userId === initialUserId) {
            identityTransition.end()
        }
    }, [identityTransition, initialUserId, isSessionPending, queryClient, router, session?.user.id])

    return null
}

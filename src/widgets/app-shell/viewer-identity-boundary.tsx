import { getSession } from '@shared/server/auth'
import { ViewerIdentitySync } from '@widgets/app-shell/viewer-identity-sync'

const readViewerUserId = async () => {
    try {
        const session = await getSession()
        return session?.user.id ?? null
    } catch {
        return undefined
    }
}

export const ViewerIdentityBoundary = async () => {
    const userId = await readViewerUserId()
    if (userId === undefined) return null
    return <ViewerIdentitySync initialUserId={userId} />
}

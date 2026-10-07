import { type FC, type PropsWithChildren, Suspense } from 'react'
import { AppShell } from '@widgets/app-shell/app-shell'
import { SocialSignInErrorNotice } from '@widgets/app-shell/social-sign-in-error-notice'
import { ViewerIdentityBoundary } from '@widgets/app-shell/viewer-identity-boundary'

const ShellLayout: FC<PropsWithChildren> = ({ children }) => (
    <AppShell>
        {children}
        <Suspense fallback={null}>
            <SocialSignInErrorNotice />
        </Suspense>
        <Suspense fallback={null}>
            <ViewerIdentityBoundary />
        </Suspense>
    </AppShell>
)
export default ShellLayout

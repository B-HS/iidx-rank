import type { FC, PropsWithChildren } from 'react'
import { AppShell } from '@widgets/app-shell/app-shell'

const ShellLayout: FC<PropsWithChildren> = ({ children }) => <AppShell>{children}</AppShell>
export default ShellLayout

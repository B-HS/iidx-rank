import type { FC, PropsWithChildren } from 'react'

type DashboardPanelEmptyProps = PropsWithChildren<{
    message: string
}>

export const DashboardPanelEmpty: FC<DashboardPanelEmptyProps> = ({ message, children }) => (
    <div className='flex min-h-16 min-w-0 flex-1 flex-col items-center justify-center gap-2 p-3 text-center'>
        <p className='text-xs text-balance text-muted-foreground'>{message}</p>
        {children}
    </div>
)

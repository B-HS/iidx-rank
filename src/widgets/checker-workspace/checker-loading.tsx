import { type FC } from 'react'

import { Skeleton } from '@shared/ui/skeleton'
import { AppShell } from '@widgets/app-shell/app-shell'

type Props = {
    label: string
}

export const CheckerLoading: FC<Props> = ({ label }) => (
    <AppShell>
        <div aria-label={label} aria-busy='true' className='checker-list-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-0'>
            <Skeleton className='h-12 shrink-0' />
            <Skeleton className='min-h-64 flex-1' />
        </div>
    </AppShell>
)

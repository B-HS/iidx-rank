import type { FC } from 'react'
import { Skeleton } from '@shared/ui/skeleton'

type EamusementHandoffProgressProps = {
    title: string
    description: string
}

const COUNT_SKELETON_IDS = ['received', 'matched', 'changed'] as const

export const EamusementHandoffProgress: FC<EamusementHandoffProgressProps> = ({ title, description }) => (
    <div role='status' aria-live='polite' aria-busy='true' className='grid min-w-0 gap-4 p-3'>
        <div className='grid min-w-0 gap-1'>
            <p className='text-sm font-semibold'>{title}</p>
            <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
        <div aria-hidden='true' className='grid max-w-xl min-w-0 grid-cols-3 gap-2'>
            {COUNT_SKELETON_IDS.map((id) => (
                <Skeleton key={id} className='h-14' />
            ))}
        </div>
        <Skeleton aria-hidden='true' className='h-64 w-full' />
    </div>
)

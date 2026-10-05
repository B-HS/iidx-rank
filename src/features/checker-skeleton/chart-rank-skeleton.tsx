import { type FC } from 'react'

import { CHART_CARD_GRID_CLASS_NAME, CHECKER_SKELETON_PERSONAL_CARD_COUNT, CHECKER_SKELETON_STANDARD_CARD_COUNT } from '@shared/constants/checker'
import { MESSAGES } from '@shared/messages/messages'
import { Card, CardContent, CardHeader } from '@shared/ui/card'
import { Skeleton } from '@shared/ui/skeleton'

const GROUPS = [
    { id: 'standard', label: MESSAGES.checker.standardGroup, count: CHECKER_SKELETON_STANDARD_CARD_COUNT },
    { id: 'personal', label: MESSAGES.checker.personalBadge, count: CHECKER_SKELETON_PERSONAL_CARD_COUNT },
] as const

export const ChartRankSkeleton: FC = () => (
    <Card aria-hidden='true' className='min-w-0 gap-px rounded-none bg-border p-0 shadow-none ring-0'>
        <CardHeader className='flex flex-row items-center justify-between bg-muted p-3'>
            <Skeleton className='h-5 w-10 bg-sidebar-accent' />
            <Skeleton className='h-4 w-20 bg-sidebar-accent' />
        </CardHeader>
        <CardContent className='grid min-w-0 gap-px p-0'>
            {GROUPS.map((group) => (
                <div key={group.id} className='grid min-w-0 gap-px bg-border'>
                    <div className='flex items-center gap-2 bg-card px-3 py-1 text-2xs text-muted-foreground'>
                        {group.label}
                        <Skeleton className='h-3 w-6' />
                    </div>
                    <div className={CHART_CARD_GRID_CLASS_NAME}>
                        {Array.from({ length: group.count }, (_, index) => group.id + '-' + index).map((id) => (
                            <Card key={id} size='sm' className='min-w-0 rounded-none bg-card p-0 shadow-none ring-0'>
                                <CardContent className='flex h-10 min-w-0 flex-col justify-between gap-1 p-1.5'>
                                    <Skeleton className='h-3 w-4/5' />
                                    <Skeleton className='h-3 w-3/5' />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
)

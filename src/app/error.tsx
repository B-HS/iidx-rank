'use client'

import { type FC } from 'react'

import { MESSAGES } from '@shared/messages/messages'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

type Props = {
    error: Error
    reset: () => void
}

const ErrorPage: FC<Props> = ({ reset }) => (
    <main className='flex min-h-0 flex-1 items-center justify-center p-3 sm:p-4'>
        <Empty className='min-h-64 max-w-xl border-0'>
            <EmptyHeader>
                <EmptyTitle>{MESSAGES.errors.genericTitle}</EmptyTitle>
                <EmptyDescription>{MESSAGES.errors.genericDescription}</EmptyDescription>
            </EmptyHeader>
            <Button variant='outline' onClick={() => reset()}>
                {MESSAGES.common.retry}
            </Button>
        </Empty>
    </main>
)

export default ErrorPage

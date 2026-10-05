import { type FC } from 'react'
import Link from 'next/link'

import { MESSAGES } from '@shared/messages/messages'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

const NotFoundPage: FC = () => (
    <main className='flex min-h-dvh items-center justify-center p-3 sm:p-4'>
        <Empty className='min-h-64 max-w-xl border-0'>
            <EmptyHeader>
                <EmptyTitle>{MESSAGES.errors.notFoundTitle}</EmptyTitle>
                <EmptyDescription>{MESSAGES.errors.notFoundDescription}</EmptyDescription>
            </EmptyHeader>
            <Button variant='outline' asChild>
                <Link href='/'>{MESSAGES.navigation.checker}</Link>
            </Button>
        </Empty>
    </main>
)

export default NotFoundPage

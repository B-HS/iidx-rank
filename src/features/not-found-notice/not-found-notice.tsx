'use client'
import { type FC, useSyncExternalStore } from 'react'
import Link from 'next/link'
import type { Locale } from 'next-intl'
import { routing } from '@shared/i18n/routing'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

type NotFoundNoticeProps = {
    statusLabel: string
    notices: { locale: Locale; title: string; description: string; homeLabel: string; homeHref: string }[]
}

const subscribeToNothing = () => () => undefined

const readServerLocale = () => null

const readPathnameLocale = () =>
    routing.locales.find((locale) => window.location.pathname === `/${locale}` || window.location.pathname.startsWith(`/${locale}/`)) ??
    routing.defaultLocale

export const NotFoundNotice: FC<NotFoundNoticeProps> = ({ statusLabel, notices }) => {
    const pathnameLocale = useSyncExternalStore(subscribeToNothing, readPathnameLocale, readServerLocale)

    return (
        <main className='flex min-h-dvh items-center justify-center p-3 sm:p-4'>
            <Empty className='min-h-64 max-w-xl border-0'>
                <EmptyHeader>
                    <EmptyTitle>
                        <h1>{statusLabel}</h1>
                    </EmptyTitle>
                </EmptyHeader>
                <ul className='grid gap-6'>
                    {notices
                        .filter((notice) => pathnameLocale === null || notice.locale === pathnameLocale)
                        .map((notice) => (
                            <li key={notice.locale} lang={notice.locale} className='grid justify-items-center gap-2'>
                                <p className='text-sm font-medium'>{notice.title}</p>
                                <EmptyDescription>{notice.description}</EmptyDescription>
                                <Button variant='outline' size='sm' asChild>
                                    <Link href={notice.homeHref}>{notice.homeLabel}</Link>
                                </Button>
                            </li>
                        ))}
                </ul>
            </Empty>
        </main>
    )
}

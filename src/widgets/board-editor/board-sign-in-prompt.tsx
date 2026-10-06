'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

export const BoardSignInPrompt: FC = () => {
    const t = useTranslations()

    return (
        <Empty className='min-h-64 border-0'>
            <EmptyHeader>
                <EmptyTitle>{t('board.signInTitle')}</EmptyTitle>
                <EmptyDescription>{t('board.signInDescription')}</EmptyDescription>
            </EmptyHeader>
            <AuthDialogWidget>
                <Button variant='outline' size='sm'>
                    {t('navigation.signIn')}
                </Button>
            </AuthDialogWidget>
        </Empty>
    )
}

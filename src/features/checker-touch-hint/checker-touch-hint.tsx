'use client'
import type { FC } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@shared/ui/button'

type Props = { onDismiss: () => void }
export const CheckerTouchHint: FC<Props> = ({ onDismiss }) => {
    const t = useTranslations()
    return (
        <div role='note' className='flex min-h-11 min-w-0 items-center justify-between gap-2 border-b border-border bg-card px-3 text-xs'>
            <p className='min-w-0 py-1 text-muted-foreground'>{t('checker.touchHint')}</p>
            <Button variant='ghost' size='icon-sm' aria-label={t('checker.touchHintDismiss')} className='shrink-0' onClick={onDismiss}>
                <X aria-hidden='true' />
            </Button>
        </div>
    )
}

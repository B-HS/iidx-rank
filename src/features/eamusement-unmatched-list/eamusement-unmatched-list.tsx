'use client'
import { type FC, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ImportResult } from '@entities/eamusement/eamusement.dto'
import { IMPORT_UNMATCHED_LIMIT } from '@shared/constants/eamusement'
import { IMPORT_DIFFICULTY_LABELS } from '@shared/constants/eamusement-display'
import { Button } from '@shared/ui/button'
import { Collapsible } from '@shared/ui/collapsible'
import { CollapsibleContent } from '@shared/ui/collapsible-content'
import { CollapsibleTrigger } from '@shared/ui/collapsible-trigger'

type EamusementUnmatchedListProps = {
    unmatched: ImportResult['unmatched']
}

export const EamusementUnmatchedList: FC<EamusementUnmatchedListProps> = ({ unmatched }) => {
    const t = useTranslations()
    const [isOpen, setIsOpen] = useState(false)

    if (unmatched.length === 0) return <p className='text-xs text-muted-foreground'>{t('settings.eamusementUnmatchedEmpty')}</p>

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className='grid min-w-0 gap-2'>
            <CollapsibleTrigger asChild>
                <Button variant='outline' size='sm' className='w-fit max-w-full justify-start'>
                    <ChevronDown aria-hidden='true' className={isOpen ? 'rotate-180' : undefined} />
                    <span className='min-w-0 truncate'>{t('settings.eamusementUnmatchedTitle', { count: unmatched.length })}</span>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className='grid min-w-0 gap-2'>
                <p className='text-xs text-muted-foreground'>{t('settings.eamusementUnmatchedHint', { limit: IMPORT_UNMATCHED_LIMIT })}</p>
                <ul className='grid max-h-64 min-w-0 overflow-y-auto border-t border-border'>
                    {unmatched.map(({ title, difficulty }) => (
                        <li
                            key={`${title}-${difficulty}`}
                            className='flex min-w-0 items-baseline justify-between gap-2 border-b border-border py-1.5 text-xs'>
                            <span className='min-w-0 break-words'>{title}</span>
                            <span className='shrink-0 text-muted-foreground'>{IMPORT_DIFFICULTY_LABELS[difficulty]}</span>
                        </li>
                    ))}
                </ul>
            </CollapsibleContent>
        </Collapsible>
    )
}

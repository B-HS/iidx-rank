'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/toggle-group'

const MODE_ITEM_CLASS_NAME = 'pointer-coarse:relative pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-2'

type Props = {
    value: 'normal' | 'hard'
    isDisabled?: boolean
    onValueChange?: (value: 'normal' | 'hard') => void
}
export const CheckerModeToggle: FC<Props> = ({ value, isDisabled = false, onValueChange }) => {
    const t = useTranslations()
    const handleValueChange = (nextValue: string) => {
        if (nextValue === 'normal' || nextValue === 'hard') onValueChange?.(nextValue)
    }
    return (
        <ToggleGroup
            type='single'
            value={value}
            disabled={isDisabled}
            onValueChange={handleValueChange}
            variant='outline'
            size='sm'
            spacing={0}
            aria-label={t('checker.modeLabel')}
            className='shrink-0'>
            <ToggleGroupItem value='normal' className={MODE_ITEM_CLASS_NAME}>
                {t('checker.normalModeShort')}
            </ToggleGroupItem>
            <ToggleGroupItem value='hard' className={MODE_ITEM_CLASS_NAME}>
                {t('checker.hardModeShort')}
            </ToggleGroupItem>
        </ToggleGroup>
    )
}

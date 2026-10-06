'use client'
import type { FC } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Toolbar } from 'radix-ui'
import { Button } from '@shared/ui/button'
import { Toggle } from '@shared/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip'

type RichTextToolbarButtonProps = {
    label: string
    icon: LucideIcon
    isDisabled: boolean
    onSelect: () => void
    isActive?: boolean
}

export const RichTextToolbarButton: FC<RichTextToolbarButtonProps> = ({ label, icon: Icon, isDisabled, onSelect, isActive }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <Toolbar.Button asChild disabled={isDisabled}>
                {isActive === undefined ? (
                    <Button variant='ghost' size='icon-sm' aria-label={label} onClick={onSelect}>
                        <Icon aria-hidden='true' />
                    </Button>
                ) : (
                    <Toggle size='sm' aria-label={label} pressed={isActive} onPressedChange={onSelect} className='px-1.5'>
                        <Icon aria-hidden='true' />
                    </Toggle>
                )}
            </Toolbar.Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
    </Tooltip>
)

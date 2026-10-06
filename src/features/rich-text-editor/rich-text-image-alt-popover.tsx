'use client'
import type { ComponentProps, FC } from 'react'
import { Captions } from 'lucide-react'
import { Toolbar } from 'radix-ui'
import { useTranslations } from 'next-intl'
import { RichTextImageAltForm } from '@features/rich-text-editor/rich-text-image-alt-form'
import { Button } from '@shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip'

type RichTextImageAltPopoverProps = {
    currentAlt: string
    isDisabled: boolean
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onApply: ComponentProps<typeof RichTextImageAltForm>['onApply']
}

export const RichTextImageAltPopover: FC<RichTextImageAltPopoverProps> = ({ currentAlt, isDisabled, isOpen, onOpenChange, onApply }) => {
    const t = useTranslations('board')

    return (
        <Popover open={isOpen} onOpenChange={onOpenChange}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Toolbar.Button asChild disabled={isDisabled}>
                            <Button variant='ghost' size='icon-sm' aria-label={t('editorImageAlt')}>
                                <Captions aria-hidden='true' />
                            </Button>
                        </Toolbar.Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('editorImageAlt')}</TooltipContent>
            </Tooltip>
            <PopoverContent align='start' className='w-80 max-w-[calc(100vw-2rem)]'>
                <RichTextImageAltForm defaultAlt={currentAlt} onApply={onApply} />
            </PopoverContent>
        </Popover>
    )
}

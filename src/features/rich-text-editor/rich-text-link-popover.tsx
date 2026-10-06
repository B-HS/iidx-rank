'use client'
import { type FC, type KeyboardEvent, useState } from 'react'
import { Link as LinkIcon } from 'lucide-react'
import { Toolbar } from 'radix-ui'
import { useTranslations } from 'next-intl'
import { RICH_TEXT_LINK_HREF_PATTERN } from '@entities/board/rich-text.extensions'
import { Button } from '@shared/ui/button'
import { FieldError } from '@shared/ui/field'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@shared/ui/popover'
import { Toggle } from '@shared/ui/toggle'
import { Tooltip, TooltipContent, TooltipTrigger } from '@shared/ui/tooltip'

type RichTextLinkPopoverProps = {
    currentHref: string | null
    isDisabled: boolean
    onApply: (href: string) => void
}

const HREF_FIELD_ID = 'rich-text-link-href'
const HREF_ERROR_ID = 'rich-text-link-href-error'
const HREF_PLACEHOLDER = 'https://'

export const RichTextLinkPopover: FC<RichTextLinkPopoverProps> = ({ currentHref, isDisabled, onApply }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [href, setHref] = useState('')
    const [isInvalid, setIsInvalid] = useState(false)
    const t = useTranslations('board')
    const handleOpenChange = (isNextOpen: boolean) => {
        if (isNextOpen) {
            setHref(currentHref ?? '')
            setIsInvalid(false)
        }

        setIsOpen(isNextOpen)
    }
    const handleApply = () => {
        const trimmedHref = href.trim()

        if (!RICH_TEXT_LINK_HREF_PATTERN.test(trimmedHref) || !URL.canParse(trimmedHref)) {
            setIsInvalid(true)
            return
        }

        onApply(trimmedHref)
        setIsOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

        event.preventDefault()
        handleApply()
    }

    return (
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Toolbar.Button asChild disabled={isDisabled}>
                            <Toggle size='sm' aria-label={t('editorLink')} pressed={currentHref !== null} className='px-1.5'>
                                <LinkIcon aria-hidden='true' />
                            </Toggle>
                        </Toolbar.Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>{t('editorLink')}</TooltipContent>
            </Tooltip>
            <PopoverContent align='start' className='w-80 max-w-[calc(100vw-2rem)]'>
                <Label htmlFor={HREF_FIELD_ID}>{t('editorLinkLabel')}</Label>
                <Input
                    id={HREF_FIELD_ID}
                    type='url'
                    inputMode='url'
                    autoComplete='off'
                    placeholder={HREF_PLACEHOLDER}
                    value={href}
                    aria-invalid={isInvalid}
                    aria-describedby={isInvalid ? HREF_ERROR_ID : undefined}
                    onChange={(event) => setHref(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <FieldError id={HREF_ERROR_ID}>{isInvalid && t('editorLinkInvalid')}</FieldError>
                <Button type='button' variant='outline' size='sm' className='justify-self-end self-end' onClick={handleApply}>
                    {t('editorLinkApply')}
                </Button>
            </PopoverContent>
        </Popover>
    )
}

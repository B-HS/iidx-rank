'use client'
import { type FC, type KeyboardEvent, useState } from 'react'
import { useTranslations } from 'next-intl'
import { RICH_TEXT_IMAGE_ALT_MAX_LENGTH } from '@entities/board/board.dto'
import { Button } from '@shared/ui/button'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'

type RichTextImageAltFormProps = {
    defaultAlt: string
    onApply: (alt: string) => void
}

const ALT_FIELD_ID = 'rich-text-image-alt'
const ALT_HINT_ID = 'rich-text-image-alt-hint'

export const RichTextImageAltForm: FC<RichTextImageAltFormProps> = ({ defaultAlt, onApply }) => {
    const [alt, setAlt] = useState(defaultAlt)
    const t = useTranslations('board')
    const handleApply = () => onApply(alt.trim())
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter' || event.nativeEvent.isComposing) return

        event.preventDefault()
        handleApply()
    }

    return (
        <>
            <Label htmlFor={ALT_FIELD_ID}>{t('editorImageAltLabel')}</Label>
            <Input
                id={ALT_FIELD_ID}
                autoComplete='off'
                maxLength={RICH_TEXT_IMAGE_ALT_MAX_LENGTH}
                value={alt}
                aria-describedby={ALT_HINT_ID}
                onChange={(event) => setAlt(event.target.value)}
                onKeyDown={handleKeyDown}
            />
            <p id={ALT_HINT_ID} className='text-xs text-muted-foreground'>
                {t('editorImageAltHint', { max: RICH_TEXT_IMAGE_ALT_MAX_LENGTH })}
            </p>
            <Button type='button' variant='outline' size='sm' className='self-end' onClick={handleApply}>
                {t('editorImageAltApply')}
            </Button>
        </>
    )
}

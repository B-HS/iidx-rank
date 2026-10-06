'use client'
import type { FC } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { BOARD_COMMENT_MAX_LENGTH, CommentCreateInputSchema, type CommentCreateInput } from '@entities/board/board.dto'
import { cn } from '@shared/lib/utils'
import { Button } from '@shared/ui/button'
import { FieldError } from '@shared/ui/field'
import { Label } from '@shared/ui/label'
import { Textarea } from '@shared/ui/textarea'

type BoardCommentFormProps = {
    isSubmitting: boolean
    errorMessage: string | undefined
    onSubmit: (input: CommentCreateInput) => void
}

const CONTENT_FIELD_ID = 'board-comment-content'
const CONTENT_ERROR_ID = 'board-comment-content-error'
const TOO_LONG_ERROR_TYPE = 'too_big'

export const BoardCommentForm: FC<BoardCommentFormProps> = ({ isSubmitting, errorMessage, onSubmit }) => {
    const t = useTranslations('board')
    const form = useForm<CommentCreateInput>({ resolver: zodResolver(CommentCreateInputSchema), defaultValues: { content: '' } })
    const contentLength = useWatch({ control: form.control, name: 'content' }).trim().length
    const contentError = form.formState.errors.content
    const isTooLong = contentLength > BOARD_COMMENT_MAX_LENGTH

    return (
        <form className='grid min-w-0 gap-2' noValidate onSubmit={form.handleSubmit(onSubmit)}>
            <Label htmlFor={CONTENT_FIELD_ID}>{t('commentFormLabel')}</Label>
            <Textarea
                id={CONTENT_FIELD_ID}
                rows={3}
                placeholder={t('commentPlaceholder')}
                readOnly={isSubmitting}
                aria-invalid={Boolean(contentError) || isTooLong}
                aria-describedby={contentError ? CONTENT_ERROR_ID : undefined}
                {...form.register('content')}
            />
            <FieldError id={CONTENT_ERROR_ID}>
                {contentError &&
                    (contentError.type === TOO_LONG_ERROR_TYPE ? t('commentTooLong', { max: BOARD_COMMENT_MAX_LENGTH }) : t('commentRequired'))}
            </FieldError>
            <FieldError>{errorMessage}</FieldError>
            <div className='flex min-w-0 items-center justify-between gap-2'>
                <span className={cn('text-xs text-muted-foreground tabular-nums', isTooLong && 'text-destructive')}>
                    {t('characterCount', { count: contentLength, max: BOARD_COMMENT_MAX_LENGTH })}
                </span>
                <Button type='submit' variant='outline' size='sm' disabled={isSubmitting || contentLength === 0 || isTooLong}>
                    {isSubmitting ? t('commentSubmitting') : t('commentSubmit')}
                </Button>
            </div>
        </form>
    )
}

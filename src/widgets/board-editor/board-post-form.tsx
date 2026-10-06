'use client'
import { type ComponentProps, type FC, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'
import { useTranslations } from 'next-intl'
import {
    BOARD_POST_KIND,
    BOARD_POST_TITLE_MAX_LENGTH,
    BoardPostKindSchema,
    PostCreateInputSchema,
    RICH_TEXT_MAX_IMAGES,
    RichTextContentSchema,
    type PostCreateInput,
} from '@entities/board/board.dto'
import { uploadImage } from '@entities/file/file.api'
import { FILE_UPLOAD_RULES, FILE_URL_PREFIX, type FilePurpose } from '@entities/file/file.dto'
import { BoardCancelButton } from '@features/board-cancel-button/board-cancel-button'
import { getRichTextImageSources, isRichTextEmpty } from '@features/rich-text-editor/rich-text-document'
import { RichTextEditor } from '@features/rich-text-editor/rich-text-editor'
import { useUnsavedChangesWarning } from '@shared/hooks/use-unsaved-changes-warning'
import { getApiErrorCode } from '@shared/lib/api-client'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { FieldError } from '@shared/ui/field'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/toggle-group'

type BoardPostFormProps = {
    defaultValues: PostCreateInput
    kindField: 'select' | 'readOnly' | 'hidden'
    isSubmitting: boolean
    isSaved: boolean
    errorMessage: string | undefined
    submitLabel: string
    submittingLabel: string
    cancelHref: string
    onSubmit: (values: PostCreateInput) => void
}

type ImageRejectReason = Parameters<ComponentProps<typeof RichTextEditor>['onImageReject']>[0]

const BOARD_FILE_PURPOSE = 'board' satisfies FilePurpose
const BOARD_IMAGE_RULES = FILE_UPLOAD_RULES[BOARD_FILE_PURPOSE]
const BYTES_PER_MEGABYTE = 1024 * 1024
const EDITOR_IMAGE_RULES = {
    mimeTypes: BOARD_IMAGE_RULES.mimeTypes,
    maxBytes: BOARD_IMAGE_RULES.maxBytes,
    maxCount: RICH_TEXT_MAX_IMAGES,
    sourcePrefix: `${FILE_URL_PREFIX}${BOARD_FILE_PURPOSE}/`,
}
const TITLE_FIELD_ID = 'board-post-title'
const TITLE_ERROR_ID = 'board-post-title-error'
const KIND_LABEL_ID = 'board-post-kind-label'
const CONTENT_LABEL_ID = 'board-post-content-label'
const CONTENT_HINT_ID = 'board-post-content-hint'
const CONTENT_ERROR_ID = 'board-post-content-error'
const TOO_LONG_ERROR_TYPE = 'too_big'
const IMAGE_UPLOAD_ERROR_TOAST_ID = 'board-image-upload-error'
const UPLOAD_ERROR_REJECT_REASONS = new Map<string, ImageRejectReason>([
    ['PAYLOAD_TOO_LARGE', 'size'],
    ['UNSUPPORTED_MEDIA_TYPE', 'type'],
])

export const BoardPostForm: FC<BoardPostFormProps> = ({
    defaultValues,
    kindField,
    isSubmitting,
    isSaved,
    errorMessage,
    submitLabel,
    submittingLabel,
    cancelHref,
    onSubmit,
}) => {
    const [uploadingCount, setUploadingCount] = useState(0)
    const t = useTranslations()
    const FormSchema = PostCreateInputSchema.extend({
        content: RichTextContentSchema.refine((content) => !isRichTextEmpty(content), t('board.contentRequired')).refine(
            (content) => getRichTextImageSources(content).every((source) => source.startsWith(EDITOR_IMAGE_RULES.sourcePrefix)),
            t('board.contentForeignImage'),
        ),
    })
    const form = useForm<z.input<typeof FormSchema>>({ resolver: zodResolver(FormSchema), defaultValues })
    const titleLength = useWatch({ control: form.control, name: 'title' }).length
    const titleError = form.formState.errors.title
    const contentError = form.formState.errors.content
    const contentErrorMessage = typeof contentError?.message === 'string' ? contentError.message : undefined
    const isUploading = uploadingCount > 0
    const hasUnsavedChanges = form.formState.isDirty && !isSaved
    const imageRejectMessages: Record<ImageRejectReason, string> = {
        type: t('board.imageTypeError'),
        size: t('board.imageSizeError', { megabytes: BOARD_IMAGE_RULES.maxBytes / BYTES_PER_MEGABYTE }),
        count: t('board.imageCountError', { max: RICH_TEXT_MAX_IMAGES }),
    }
    const handleImageUpload = async (file: File) => {
        setUploadingCount((count) => count + 1)

        try {
            return (await uploadImage(file, BOARD_FILE_PURPOSE)).url
        } catch (error) {
            const rejectReason = UPLOAD_ERROR_REJECT_REASONS.get(getApiErrorCode(error))

            toast.error(t('board.imageUploadError'), {
                id: IMAGE_UPLOAD_ERROR_TOAST_ID,
                description: rejectReason ? imageRejectMessages[rejectReason] : undefined,
            })
            return null
        } finally {
            setUploadingCount((count) => count - 1)
        }
    }
    const handleKindChange = (value: string, onChange: (kind: PostCreateInput['kind']) => void) => {
        const kind = BoardPostKindSchema.safeParse(value)

        if (kind.success) onChange(kind.data)
    }

    useUnsavedChangesWarning(hasUnsavedChanges)

    return (
        <form className='grid w-full max-w-3xl min-w-0 gap-4 p-3' noValidate onSubmit={form.handleSubmit(onSubmit)}>
            {kindField !== 'hidden' && (
                <div className='grid min-w-0 gap-1.5'>
                    <span id={KIND_LABEL_ID} className='text-sm leading-none font-medium'>
                        {t('board.kindLabel')}
                    </span>
                    {kindField === 'select' ? (
                        <Controller
                            control={form.control}
                            name='kind'
                            render={({ field }) => (
                                <ToggleGroup
                                    type='single'
                                    variant='outline'
                                    size='sm'
                                    spacing={0}
                                    aria-labelledby={KIND_LABEL_ID}
                                    value={field.value}
                                    disabled={isSubmitting}
                                    onValueChange={(value) => handleKindChange(value, field.onChange)}>
                                    <ToggleGroupItem value={BOARD_POST_KIND.GENERAL}>{t('board.kindGeneral')}</ToggleGroupItem>
                                    <ToggleGroupItem value={BOARD_POST_KIND.NOTICE}>{t('board.kindNotice')}</ToggleGroupItem>
                                </ToggleGroup>
                            )}
                        />
                    ) : (
                        <Badge variant='secondary'>
                            {defaultValues.kind === BOARD_POST_KIND.NOTICE ? t('board.kindNotice') : t('board.kindGeneral')}
                        </Badge>
                    )}
                </div>
            )}
            <div className='grid min-w-0 gap-1.5'>
                <div className='flex min-w-0 items-center justify-between gap-2'>
                    <Label htmlFor={TITLE_FIELD_ID}>{t('board.titleLabel')}</Label>
                    <span className='text-xs text-muted-foreground tabular-nums'>
                        {t('board.characterCount', { count: titleLength, max: BOARD_POST_TITLE_MAX_LENGTH })}
                    </span>
                </div>
                <Input
                    id={TITLE_FIELD_ID}
                    autoComplete='off'
                    maxLength={BOARD_POST_TITLE_MAX_LENGTH}
                    placeholder={t('board.titlePlaceholder')}
                    readOnly={isSubmitting}
                    aria-invalid={Boolean(titleError)}
                    aria-describedby={titleError ? TITLE_ERROR_ID : undefined}
                    {...form.register('title')}
                />
                <FieldError id={TITLE_ERROR_ID}>
                    {titleError &&
                        (titleError.type === TOO_LONG_ERROR_TYPE
                            ? t('board.titleTooLong', { max: BOARD_POST_TITLE_MAX_LENGTH })
                            : t('board.titleRequired'))}
                </FieldError>
            </div>
            <div className='grid min-w-0 gap-1.5'>
                <span id={CONTENT_LABEL_ID} className='text-sm leading-none font-medium'>
                    {t('board.contentLabel')}
                </span>
                <Controller
                    control={form.control}
                    name='content'
                    render={({ field }) => (
                        <RichTextEditor
                            content={defaultValues.content}
                            label={t('board.contentLabel')}
                            isDisabled={isSubmitting}
                            isInvalid={Boolean(contentError)}
                            isUploading={isUploading}
                            describedBy={contentError ? `${CONTENT_HINT_ID} ${CONTENT_ERROR_ID}` : CONTENT_HINT_ID}
                            imageRules={EDITOR_IMAGE_RULES}
                            onChange={field.onChange}
                            onImageUpload={handleImageUpload}
                            onImageReject={(reason) => toast.error(imageRejectMessages[reason], { id: reason })}
                        />
                    )}
                />
                <p id={CONTENT_HINT_ID} className='text-xs text-muted-foreground'>
                    {t('board.imageHint', { megabytes: BOARD_IMAGE_RULES.maxBytes / BYTES_PER_MEGABYTE, max: RICH_TEXT_MAX_IMAGES })}
                </p>
                <FieldError id={CONTENT_ERROR_ID}>{contentErrorMessage}</FieldError>
            </div>
            <FieldError>{errorMessage}</FieldError>
            <div className='flex min-w-0 items-center justify-end gap-2'>
                <BoardCancelButton href={cancelHref} hasUnsavedChanges={hasUnsavedChanges} />
                <Button type='submit' size='sm' disabled={isSubmitting || isUploading}>
                    {isSubmitting ? submittingLabel : submitLabel}
                </Button>
            </div>
        </form>
    )
}

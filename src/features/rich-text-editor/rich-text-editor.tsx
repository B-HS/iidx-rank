'use client'
import { type FC, useEffect, useEffectEvent, useState } from 'react'
import { FileHandler } from '@tiptap/extension-file-handler'
import { EditorContent, useEditor } from '@tiptap/react'
import { useTranslations } from 'next-intl'
import type { RichTextContent } from '@entities/board/board.dto'
import { RICH_TEXT_EXTENSIONS } from '@entities/board/rich-text.extensions'
import { RICH_TEXT_TYPOGRAPHY_CLASS_NAME } from '@features/rich-text-content/rich-text-typography'
import { createEventChannel } from '@features/rich-text-editor/create-event-channel'
import { hasPastedText, keepAllowedImages } from '@features/rich-text-editor/pasted-html'
import { getRichTextImageSources } from '@features/rich-text-editor/rich-text-document'
import { RichTextToolbar } from '@features/rich-text-editor/rich-text-toolbar'
import { cn } from '@shared/lib/utils'

type RichTextImageRules = {
    mimeTypes: readonly string[]
    maxBytes: number
    maxCount: number
    sourcePrefix: string
}

type RichTextEditorProps = {
    content: RichTextContent
    label: string
    isDisabled: boolean
    isInvalid: boolean
    isUploading: boolean
    imageRules: RichTextImageRules
    onChange: (content: RichTextContent) => void
    onImageUpload: (file: File) => Promise<string | null>
    onImageReject: (reason: NonNullable<ReturnType<typeof getImageRejectReason>>) => void
}

type ReceivedFiles = {
    files: File[]
    html: string | undefined
    position: number | null
}

const IMAGE_NODE_TYPE = 'image'
const EDITOR_FRAME_CLASS_NAME = 'min-w-0 border border-input bg-card'
const EDITOR_BODY_CLASS_NAME = 'min-h-64 p-3'
const EDITOR_CONTENT_CLASS_NAME = `${RICH_TEXT_TYPOGRAPHY_CLASS_NAME} ${EDITOR_BODY_CLASS_NAME} outline-none [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-ring`

const getImageRejectReason = (file: File, imageCount: number, rules: RichTextImageRules) => {
    if (!rules.mimeTypes.includes(file.type)) return 'type'
    if (file.size > rules.maxBytes) return 'size'
    if (imageCount >= rules.maxCount) return 'count'

    return null
}

export const RichTextEditor: FC<RichTextEditorProps> = ({
    content,
    label,
    isDisabled,
    isInvalid,
    isUploading,
    imageRules,
    onChange,
    onImageUpload,
    onImageReject,
}) => {
    const [receivedFiles] = useState(() => createEventChannel<ReceivedFiles>())
    const [extensions] = useState(() => [
        ...RICH_TEXT_EXTENSIONS,
        FileHandler.configure({
            onPaste: (_editor, files, html) => receivedFiles.emit({ files, html, position: null }),
            onDrop: (_editor, files, position) => receivedFiles.emit({ files, html: undefined, position }),
        }),
    ])
    const t = useTranslations('board')
    const editor = useEditor({
        extensions,
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                role: 'textbox',
                'aria-multiline': 'true',
                'aria-label': label,
                'aria-invalid': String(isInvalid),
                class: EDITOR_CONTENT_CLASS_NAME,
            },
            transformPastedHTML: (html) => keepAllowedImages(html, imageRules.sourcePrefix),
        },
        onUpdate: ({ editor: updatedEditor }) => onChange(updatedEditor.getJSON()),
    })
    const insertImage = async (file: File, position: number | null) => {
        if (!editor || editor.isDestroyed) return

        const rejectReason = getImageRejectReason(file, getRichTextImageSources(editor.getJSON()).length, imageRules)

        if (rejectReason) {
            onImageReject(rejectReason)
            return
        }

        const source = await onImageUpload(file)

        if (source === null || editor.isDestroyed) return

        if (position === null) {
            editor.chain().focus().setImage({ src: source }).run()
            return
        }

        editor
            .chain()
            .focus()
            .insertContentAt(Math.min(position, editor.state.doc.content.size), { type: IMAGE_NODE_TYPE, attrs: { src: source } })
            .run()
    }
    const insertImages = async (files: File[], position: number | null) => {
        if (isDisabled) return

        for (const [index, file] of files.entries()) await insertImage(file, index === 0 ? position : null)
    }

    const handleReceivedFiles = useEffectEvent(({ files, html, position }: ReceivedFiles) => {
        if (html && hasPastedText(html)) return

        void insertImages(files, position)
    })

    useEffect(() => receivedFiles.subscribe((received) => handleReceivedFiles(received)), [receivedFiles])
    useEffect(() => {
        editor?.setEditable(!isDisabled, false)
    }, [editor, isDisabled])

    if (!editor) {
        return (
            <div role='status' aria-label={t('editorLoading')} aria-busy='true' className={EDITOR_FRAME_CLASS_NAME}>
                <div className='h-9 border-b border-border' />
                <div className={EDITOR_BODY_CLASS_NAME} />
            </div>
        )
    }

    return (
        <div
            className={cn(
                EDITOR_FRAME_CLASS_NAME,
                'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
                isInvalid && 'border-destructive',
            )}>
            <RichTextToolbar
                editor={editor}
                isDisabled={isDisabled}
                imageAccept={imageRules.mimeTypes.join(',')}
                onImageFiles={(files) => void insertImages(files, null)}
            />
            <EditorContent editor={editor} />
            {isUploading && (
                <p role='status' className='border-t border-border px-3 py-1.5 text-xs text-muted-foreground'>
                    {t('editorImageUploading')}
                </p>
            )}
        </div>
    )
}

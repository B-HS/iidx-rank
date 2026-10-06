'use client'
import { type ChangeEvent, type FC, Fragment, useRef, useState } from 'react'
import { NodeSelection } from '@tiptap/pm/state'
import { useEditorState, type Editor } from '@tiptap/react'
import {
    Bold,
    Heading2,
    Heading3,
    ImagePlus,
    Italic,
    List,
    ListOrdered,
    type LucideIcon,
    Redo2,
    SquareCode,
    Strikethrough,
    TextQuote,
    Underline,
    Undo2,
    Unlink,
} from 'lucide-react'
import { Toolbar } from 'radix-ui'
import { useTranslations, type Messages } from 'next-intl'
import type { ChainedCommands } from '@tiptap/core'
import { RICH_TEXT_HEADING_LEVELS } from '@entities/board/rich-text.extensions'
import { IMAGE_NODE_TYPE } from '@features/rich-text-editor/rich-text-document'
import { RichTextImageAltPopover } from '@features/rich-text-editor/rich-text-image-alt-popover'
import { RichTextLinkPopover } from '@features/rich-text-editor/rich-text-link-popover'
import { RichTextToolbarButton } from '@features/rich-text-editor/rich-text-toolbar-button'
import { Separator } from '@shared/ui/separator'

type RichTextToolbarProps = {
    editor: Editor
    isDisabled: boolean
    imageAccept: string
    onImageFiles: (files: File[]) => Promise<boolean>
}

type ToggleAction = {
    id: string
    labelKey: Extract<keyof Messages['board'], `editor${string}`>
    icon: LucideIcon
    isActive: (editor: Editor) => boolean
    run: (chain: ChainedCommands) => ChainedCommands
}

const [PRIMARY_HEADING_LEVEL, SECONDARY_HEADING_LEVEL] = RICH_TEXT_HEADING_LEVELS
const LINK_MARK_NAME = 'link'

const TOGGLE_ACTION_GROUPS: readonly { id: string; actions: readonly ToggleAction[] }[] = [
    {
        id: 'marks',
        actions: [
            { id: 'bold', labelKey: 'editorBold', icon: Bold, isActive: (editor) => editor.isActive('bold'), run: (chain) => chain.toggleBold() },
            {
                id: 'italic',
                labelKey: 'editorItalic',
                icon: Italic,
                isActive: (editor) => editor.isActive('italic'),
                run: (chain) => chain.toggleItalic(),
            },
            {
                id: 'underline',
                labelKey: 'editorUnderline',
                icon: Underline,
                isActive: (editor) => editor.isActive('underline'),
                run: (chain) => chain.toggleUnderline(),
            },
            {
                id: 'strike',
                labelKey: 'editorStrike',
                icon: Strikethrough,
                isActive: (editor) => editor.isActive('strike'),
                run: (chain) => chain.toggleStrike(),
            },
        ],
    },
    {
        id: 'blocks',
        actions: [
            {
                id: 'primaryHeading',
                labelKey: 'editorHeadingLarge',
                icon: Heading2,
                isActive: (editor) => editor.isActive('heading', { level: PRIMARY_HEADING_LEVEL }),
                run: (chain) => chain.toggleHeading({ level: PRIMARY_HEADING_LEVEL }),
            },
            {
                id: 'secondaryHeading',
                labelKey: 'editorHeadingSmall',
                icon: Heading3,
                isActive: (editor) => editor.isActive('heading', { level: SECONDARY_HEADING_LEVEL }),
                run: (chain) => chain.toggleHeading({ level: SECONDARY_HEADING_LEVEL }),
            },
            {
                id: 'bulletList',
                labelKey: 'editorBulletList',
                icon: List,
                isActive: (editor) => editor.isActive('bulletList'),
                run: (chain) => chain.toggleBulletList(),
            },
            {
                id: 'orderedList',
                labelKey: 'editorOrderedList',
                icon: ListOrdered,
                isActive: (editor) => editor.isActive('orderedList'),
                run: (chain) => chain.toggleOrderedList(),
            },
            {
                id: 'blockquote',
                labelKey: 'editorBlockquote',
                icon: TextQuote,
                isActive: (editor) => editor.isActive('blockquote'),
                run: (chain) => chain.toggleBlockquote(),
            },
            {
                id: 'codeBlock',
                labelKey: 'editorCodeBlock',
                icon: SquareCode,
                isActive: (editor) => editor.isActive('codeBlock'),
                run: (chain) => chain.toggleCodeBlock(),
            },
        ],
    },
]

const TOOLBAR_SEPARATOR_CLASS_NAME = 'mx-1 h-5 data-vertical:self-center'

export const RichTextToolbar: FC<RichTextToolbarProps> = ({ editor, isDisabled, imageAccept, onImageFiles }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isImageAltOpen, setIsImageAltOpen] = useState(false)
    const t = useTranslations('board')
    const toolbarState = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => {
            const linkHref: unknown = currentEditor.getAttributes(LINK_MARK_NAME).href
            const imageAlt: unknown = currentEditor.getAttributes(IMAGE_NODE_TYPE).alt
            const { selection } = currentEditor.state

            return {
                activeActionIds: TOGGLE_ACTION_GROUPS.flatMap((group) => group.actions)
                    .filter((action) => action.isActive(currentEditor))
                    .map((action) => action.id),
                linkHref: currentEditor.isActive(LINK_MARK_NAME) && typeof linkHref === 'string' ? linkHref : null,
                isSelectionEmpty: selection.empty,
                isImageSelected: selection instanceof NodeSelection && selection.node.type.name === IMAGE_NODE_TYPE,
                imageAlt: typeof imageAlt === 'string' ? imageAlt : '',
                canUndo: currentEditor.can().undo(),
                canRedo: currentEditor.can().redo(),
            }
        },
    })
    const handleLinkApply = (href: string) => {
        if (toolbarState.isSelectionEmpty && toolbarState.linkHref === null) {
            editor
                .chain()
                .focus()
                .insertContent({ type: 'text', text: href, marks: [{ type: LINK_MARK_NAME, attrs: { href } }] })
                .run()
            return
        }

        editor.chain().focus().extendMarkRange(LINK_MARK_NAME).setLink({ href }).run()
    }
    const handleImageAltApply = (alt: string) => {
        editor.chain().updateAttributes(IMAGE_NODE_TYPE, { alt }).run()
        setIsImageAltOpen(false)
    }
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = [...(event.target.files ?? [])]

        event.target.value = ''

        if (files.length > 0 && (await onImageFiles(files))) setIsImageAltOpen(true)
    }

    return (
        <Toolbar.Root
            aria-label={t('editorToolbar')}
            className='sticky top-(--rail-chrome-height) z-(--z-rail) flex min-w-0 flex-wrap items-center gap-0.5 border-b border-border bg-card p-1 md:top-0'>
            {TOGGLE_ACTION_GROUPS.map((group) => (
                <Fragment key={group.id}>
                    {group.actions.map((action) => (
                        <RichTextToolbarButton
                            key={action.id}
                            label={t(action.labelKey)}
                            icon={action.icon}
                            isDisabled={isDisabled}
                            isActive={toolbarState.activeActionIds.includes(action.id)}
                            onSelect={() => action.run(editor.chain().focus()).run()}
                        />
                    ))}
                    <Separator orientation='vertical' className={TOOLBAR_SEPARATOR_CLASS_NAME} />
                </Fragment>
            ))}
            <RichTextLinkPopover currentHref={toolbarState.linkHref} isDisabled={isDisabled} onApply={handleLinkApply} />
            <RichTextToolbarButton
                label={t('editorLinkRemove')}
                icon={Unlink}
                isDisabled={isDisabled || toolbarState.linkHref === null}
                onSelect={() => editor.chain().focus().extendMarkRange(LINK_MARK_NAME).unsetLink().run()}
            />
            <RichTextToolbarButton label={t('editorImage')} icon={ImagePlus} isDisabled={isDisabled} onSelect={() => fileInputRef.current?.click()} />
            <input
                ref={fileInputRef}
                type='file'
                accept={imageAccept}
                multiple
                hidden
                tabIndex={-1}
                aria-label={t('editorImage')}
                onChange={(event) => void handleFileChange(event)}
            />
            <RichTextImageAltPopover
                currentAlt={toolbarState.imageAlt}
                isDisabled={isDisabled || !toolbarState.isImageSelected}
                isOpen={isImageAltOpen}
                onOpenChange={setIsImageAltOpen}
                onApply={handleImageAltApply}
            />
            <Separator orientation='vertical' className={TOOLBAR_SEPARATOR_CLASS_NAME} />
            <RichTextToolbarButton
                label={t('editorUndo')}
                icon={Undo2}
                isDisabled={isDisabled || !toolbarState.canUndo}
                onSelect={() => editor.chain().focus().undo().run()}
            />
            <RichTextToolbarButton
                label={t('editorRedo')}
                icon={Redo2}
                isDisabled={isDisabled || !toolbarState.canRedo}
                onSelect={() => editor.chain().focus().redo().run()}
            />
        </Toolbar.Root>
    )
}

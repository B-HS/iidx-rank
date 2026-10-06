import type { FC } from 'react'
import { renderToReactElement } from '@tiptap/static-renderer/pm/react'
import { z } from 'zod'
import type { JSONContent } from '@tiptap/core'
import { RICH_TEXT_EXTENSIONS } from '@entities/board/rich-text.extensions'
import { RICH_TEXT_TYPOGRAPHY_CLASS_NAME } from '@features/rich-text-content/rich-text-typography'

type RichTextContentProps = {
    content: JSONContent
}

const NullableDimensionSchema = z.number().positive().nullable().catch(null)
const ImageAttributesSchema = z.object({
    src: z.string(),
    alt: z.string().nullable().catch(null),
    width: NullableDimensionSchema,
    height: NullableDimensionSchema,
})

export const RichTextContent: FC<RichTextContentProps> = ({ content }) => (
    <div className={RICH_TEXT_TYPOGRAPHY_CLASS_NAME}>
        {renderToReactElement({
            content,
            extensions: RICH_TEXT_EXTENSIONS,
            options: {
                nodeMapping: {
                    image: ({ node }) => {
                        const attributes = ImageAttributesSchema.safeParse(node.attrs)

                        if (!attributes.success) return null

                        const { src, alt, width, height } = attributes.data

                        return (
                            <img src={src} alt={alt ?? ''} width={width ?? undefined} height={height ?? undefined} loading='lazy' decoding='async' />
                        )
                    },
                },
            },
        })}
    </div>
)

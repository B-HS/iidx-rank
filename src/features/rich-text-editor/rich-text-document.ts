import { z } from 'zod'

const IMAGE_NODE_TYPE = 'image'
const TEXT_NODE_TYPE = 'text'

const RichTextNodeSchema = z.object({
    type: z.string().optional(),
    text: z.string().optional(),
    attrs: z.object({ src: z.unknown() }).optional(),
    content: z.array(z.unknown()).optional(),
})

const readRichTextNodes = (node: unknown): z.infer<typeof RichTextNodeSchema>[] => {
    const parsedNode = RichTextNodeSchema.safeParse(node)

    if (!parsedNode.success) return []

    return [parsedNode.data, ...(parsedNode.data.content ?? []).flatMap(readRichTextNodes)]
}

/**
 * Lists the `src` of every image node in a rich text document. Images without a string source are reported as an empty string.
 * @param document - editor JSON document
 */
export const getRichTextImageSources = (document: unknown) =>
    readRichTextNodes(document)
        .filter((node) => node.type === IMAGE_NODE_TYPE)
        .map((node) => (typeof node.attrs?.src === 'string' ? node.attrs.src : ''))

/**
 * Tells whether a rich text document has neither visible text nor an image.
 * @param document - editor JSON document
 */
export const isRichTextEmpty = (document: unknown) =>
    readRichTextNodes(document).every((node) => node.type !== IMAGE_NODE_TYPE && (node.type !== TEXT_NODE_TYPE || (node.text ?? '').trim() === ''))

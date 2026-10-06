import { getRichTextPlainText, type RichTextDocument } from '@entities/board/rich-text'

const IMAGE_NODE_TYPE = 'image'

const findFirstImageSource = (node: RichTextDocument): string | null => {
    if (node.type === IMAGE_NODE_TYPE) {
        const source: unknown = node.attrs?.src

        return typeof source === 'string' ? source : null
    }

    return (node.content ?? []).reduce<string | null>((found, child) => found ?? findFirstImageSource(child), null)
}

/**
 * Summarizes a validated rich text document for metadata and structured data.
 * @param document - document returned by `parseRichTextDocument`, or null when validation failed
 */
export const getRichTextSummary = (document: RichTextDocument | null) => ({
    text: document ? getRichTextPlainText(document) : '',
    imageSource: document ? findFirstImageSource(document) : null,
})

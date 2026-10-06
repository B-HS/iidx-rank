import { getSchema } from '@tiptap/core'
import { Node } from '@tiptap/pm/model'
import { z } from 'zod'
import type { JSONContent } from '@tiptap/core'
import { RICH_TEXT_MAX_BYTES, RICH_TEXT_MAX_IMAGES } from '@entities/board/board.dto'
import {
    RICH_TEXT_EXTENSIONS,
    RICH_TEXT_HEADING_LEVELS,
    RICH_TEXT_LINK_HREF_PATTERN,
    RICH_TEXT_LINK_HTML_ATTRIBUTES,
} from '@entities/board/rich-text.extensions'
import { FILE_KEY_PATTERN, FILE_URL_PREFIX, type FilePurpose } from '@entities/file/file.dto'

const RICH_TEXT_MAX_JSON_DEPTH = 100
const RICH_TEXT_SCHEMA = getSchema(RICH_TEXT_EXTENSIONS)
const NODE_TYPE = { DOCUMENT: 'doc', TEXT: 'text', HARD_BREAK: 'hardBreak', IMAGE: 'image' } as const
const LINE_BREAK = '\n'
const BOARD_FILE_PURPOSE: FilePurpose = 'board'
const BOARD_IMAGE_SOURCE_PREFIX = `${FILE_URL_PREFIX}${BOARD_FILE_PURPOSE}/`
const CODE_LANGUAGE_PATTERN = /^[\w+#.-]+$/
const ORDERED_LIST_TYPES = ['1', 'a', 'A', 'i', 'I'] as const
const ORDERED_LIST_DEFAULT_START = 1

const NoAttributesSchema = z.undefined()
const NullableTextSchema = z.string().nullable().catch(null)
const NullableDimensionSchema = z.number().positive().nullable().catch(null)

const ATTRIBUTES_SCHEMA_BY_TYPE = new Map<string, z.ZodType<Record<string, unknown> | undefined>>([
    ['heading', z.object({ level: z.literal(RICH_TEXT_HEADING_LEVELS) })],
    ['codeBlock', z.object({ language: z.string().regex(CODE_LANGUAGE_PATTERN).nullable().catch(null) })],
    [
        'orderedList',
        z.object({
            start: z.number().int().catch(ORDERED_LIST_DEFAULT_START),
            type: z.enum(ORDERED_LIST_TYPES).nullable().catch(null),
        }),
    ],
    [
        NODE_TYPE.IMAGE,
        z.object({
            src: z
                .string()
                .startsWith(BOARD_IMAGE_SOURCE_PREFIX)
                .refine((source) => FILE_KEY_PATTERN.test(source.slice(FILE_URL_PREFIX.length))),
            alt: NullableTextSchema,
            title: NullableTextSchema,
            width: NullableDimensionSchema,
            height: NullableDimensionSchema,
        }),
    ],
    [
        'link',
        z
            .object({ href: z.string().regex(RICH_TEXT_LINK_HREF_PATTERN), title: NullableTextSchema })
            .transform((attributes) => ({ ...attributes, ...RICH_TEXT_LINK_HTML_ATTRIBUTES })),
    ],
])

export type RichTextDocument = JSONContent
export type RichTextFailureReason = 'TOO_DEEP' | 'TOO_LARGE' | 'INVALID_STRUCTURE' | 'INVALID_ATTRIBUTE' | 'TOO_MANY_IMAGES' | 'EMPTY'

type RichTextMark = NonNullable<JSONContent['marks']>[number]

const failure = <Reason extends RichTextFailureReason>(reason: Reason) => ({ ok: false as const, reason })

const getNestedValues = (value: unknown): unknown[] => {
    if (Array.isArray(value)) return value
    if (typeof value === 'object' && value !== null) return Object.values(value)

    return []
}

const isWithinDepthLimit = (values: unknown[], depth = 1): boolean => {
    if (values.length === 0) return true
    if (depth > RICH_TEXT_MAX_JSON_DEPTH) return false

    return isWithinDepthLimit(values.flatMap(getNestedValues), depth + 1)
}

const getSerializedBytes = (value: unknown) => new TextEncoder().encode(JSON.stringify(value)).byteLength

const readNormalizedDocument = (input: unknown): JSONContent => {
    const node = Node.fromJSON(RICH_TEXT_SCHEMA, input)

    node.check()

    return node.toJSON()
}

const sanitizeAttributes = (type: string | undefined, attributes: unknown) =>
    (ATTRIBUTES_SCHEMA_BY_TYPE.get(type ?? '') ?? NoAttributesSchema).parse(attributes)

const sanitizeMark = (mark: RichTextMark) => {
    const attrs = sanitizeAttributes(mark.type, mark.attrs)

    return { type: mark.type, ...(attrs && { attrs }) }
}

const sanitizeNode = (node: JSONContent): JSONContent => {
    const attrs = sanitizeAttributes(node.type, node.attrs)

    return {
        ...node,
        ...(attrs && { attrs }),
        ...(node.content && { content: node.content.map(sanitizeNode) }),
        ...(node.marks && { marks: node.marks.map(sanitizeMark) }),
    }
}

const collectNodes = (node: JSONContent): JSONContent[] => [node, ...(node.content ?? []).flatMap(collectNodes)]

const isInlineNode = (node: JSONContent) => node.type === NODE_TYPE.TEXT || node.type === NODE_TYPE.HARD_BREAK

/**
 * Extracts plain text from a rich text node. Block nodes are separated by line breaks.
 * @param node - rich text document or any node inside it
 */
export const getRichTextPlainText = (node: JSONContent): string => {
    if (node.type === NODE_TYPE.TEXT) return node.text ?? ''
    if (node.type === NODE_TYPE.HARD_BREAK) return LINE_BREAK

    const children = node.content ?? []

    if (children.some(isInlineNode)) return children.map(getRichTextPlainText).join('')

    return children
        .map(getRichTextPlainText)
        .filter((text) => text !== '')
        .join(LINE_BREAK)
}

const parseDocument = (input: unknown) => {
    if (!isWithinDepthLimit([input])) return failure('TOO_DEEP')
    if (getSerializedBytes(input) > RICH_TEXT_MAX_BYTES) return failure('TOO_LARGE')

    const normalized = readNormalizedDocument(input)

    if (normalized.type !== NODE_TYPE.DOCUMENT) return failure('INVALID_STRUCTURE')

    const document = sanitizeNode(normalized)

    if (getSerializedBytes(document) > RICH_TEXT_MAX_BYTES) return failure('TOO_LARGE')

    const imageCount = collectNodes(document).filter((node) => node.type === NODE_TYPE.IMAGE).length

    if (imageCount > RICH_TEXT_MAX_IMAGES) return failure('TOO_MANY_IMAGES')
    if (imageCount === 0 && getRichTextPlainText(document).trim() === '') return failure('EMPTY')

    return { ok: true as const, document }
}

/**
 * Validates untrusted rich text JSON against the shared schema and returns the normalized document.
 * @param input - JSON produced by the editor, received from an untrusted boundary
 */
export const parseRichTextDocument = (input: unknown) => {
    try {
        return parseDocument(input)
    } catch (error) {
        return failure(error instanceof z.ZodError ? 'INVALID_ATTRIBUTE' : 'INVALID_STRUCTURE')
    }
}

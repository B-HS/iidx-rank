import { z } from 'zod'
import { RICH_TEXT_HEADING_LEVELS } from '@entities/board/rich-text.extensions'

const [PRIMARY_HEADING_LEVEL, SECONDARY_HEADING_LEVEL] = RICH_TEXT_HEADING_LEVELS
const HeadingLevelSchema = z.literal(RICH_TEXT_HEADING_LEVELS).catch(PRIMARY_HEADING_LEVEL)
const HEADING_TAG_BY_LEVEL = { [PRIMARY_HEADING_LEVEL]: 'h3', [SECONDARY_HEADING_LEVEL]: 'h4' } as const satisfies Record<
    (typeof RICH_TEXT_HEADING_LEVELS)[number],
    string
>

/**
 * Maps a stored heading level to the tag it is displayed with. Body headings sit below the page title (h1) and the post title (h2).
 * An unknown level falls back to the first allowed one.
 * @param level - `level` attribute of a heading node
 */
export const getRichTextHeadingTag = (level: unknown) => HEADING_TAG_BY_LEVEL[HeadingLevelSchema.parse(level)]

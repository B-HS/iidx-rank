import { Image } from '@tiptap/extension-image'
import { StarterKit } from '@tiptap/starter-kit'

export const RICH_TEXT_HEADING_LEVELS = [2, 3] as const
export const RICH_TEXT_LINK_HREF_PATTERN = /^https?:\/\//i
export const RICH_TEXT_LINK_HTML_ATTRIBUTES = { target: '_blank', rel: 'noopener noreferrer nofollow', class: null } as const

export const RICH_TEXT_EXTENSIONS = [
    StarterKit.configure({
        heading: { levels: [...RICH_TEXT_HEADING_LEVELS] },
        link: { isAllowedUri: (uri) => RICH_TEXT_LINK_HREF_PATTERN.test(uri), HTMLAttributes: RICH_TEXT_LINK_HTML_ATTRIBUTES },
    }),
    Image.configure({ allowBase64: false }),
]

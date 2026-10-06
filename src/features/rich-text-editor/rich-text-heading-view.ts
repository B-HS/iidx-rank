import { Extension } from '@tiptap/core'
import { Plugin } from '@tiptap/pm/state'
import { getRichTextHeadingTag } from '@features/rich-text-content/rich-text-heading'

const HEADING_NODE_TYPE = 'heading'

/**
 * Renders headings inside the editor with the tags the published post uses, so the editor and the post share one typography.
 * The stored document and the clipboard output keep the schema's own heading levels.
 */
export const RichTextHeadingView = Extension.create({
    name: 'richTextHeadingView',
    addProseMirrorPlugins: () => [
        new Plugin({
            props: {
                nodeViews: {
                    [HEADING_NODE_TYPE]: (node) => {
                        const heading = document.createElement(getRichTextHeadingTag(node.attrs.level))

                        return { dom: heading, contentDOM: heading }
                    },
                },
            },
        }),
    ],
})

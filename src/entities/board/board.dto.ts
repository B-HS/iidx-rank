import { z } from 'zod'
import { UserSummarySchema } from '@entities/profile/user-summary.dto'
import { BOARD_POST_KINDS } from '@shared/constants/board'
import { PaginationSchema } from '@shared/lib/pagination'

const BYTES_PER_KILOBYTE = 1024
const RICH_TEXT_MAX_KILOBYTES = 200
const POST_REQUEST_OVERHEAD_KILOBYTES = 4
const MILLISECONDS_PER_MINUTE = 60_000
const RATE_LIMIT_WINDOW_MINUTES = 10

export const BOARD_POSTS_PAGE_SIZE = 20
export const BOARD_NOTICES_LIMIT = 5
export const BOARD_COMMENTS_PAGE_SIZE = 30
export const BOARD_POST_TITLE_MAX_LENGTH = 100
export const BOARD_COMMENT_MAX_LENGTH = 1000
export const BOARD_RATE_LIMIT_WINDOW_MS = RATE_LIMIT_WINDOW_MINUTES * MILLISECONDS_PER_MINUTE
export const BOARD_POST_RATE_LIMIT_MAX = 5
export const BOARD_COMMENT_RATE_LIMIT_MAX = 20
export const RICH_TEXT_MAX_BYTES = RICH_TEXT_MAX_KILOBYTES * BYTES_PER_KILOBYTE
export const RICH_TEXT_MAX_IMAGES = 20
export const RICH_TEXT_IMAGE_ALT_MAX_LENGTH = 200
export const BOARD_POST_MAX_REQUEST_BYTES = RICH_TEXT_MAX_BYTES + POST_REQUEST_OVERHEAD_KILOBYTES * BYTES_PER_KILOBYTE

export const BoardPostKindSchema = z.enum(BOARD_POST_KINDS)
export type BoardPostKind = z.infer<typeof BoardPostKindSchema>
export const BOARD_POST_KIND = { NOTICE: 'notice', GENERAL: 'general' } as const satisfies Record<string, BoardPostKind>

export const BoardIdSchema = z.uuid()
export const BoardPageQuerySchema = z.object({ page: z.coerce.number().int().positive().default(1) })
export const BOARD_COMMENTS_PAGE_PARAM = 'comments'
export const BoardCommentsPageSchema = z.coerce.number().int().positive().catch(1)

export const AuthorSchema = UserSummarySchema
export type Author = z.infer<typeof AuthorSchema>

export const PostTitleSchema = z.string().trim().min(1).max(BOARD_POST_TITLE_MAX_LENGTH)
export const RichTextContentSchema = z.record(z.string(), z.unknown())
export type RichTextContent = z.infer<typeof RichTextContentSchema>

export const PostSummarySchema = z.object({
    id: BoardIdSchema,
    kind: BoardPostKindSchema,
    title: z.string(),
    author: AuthorSchema,
    commentCount: z.number().int().nonnegative(),
    createdAt: z.string(),
    updatedAt: z.string(),
})
export type PostSummary = z.infer<typeof PostSummarySchema>

export const PostSchema = PostSummarySchema.extend({ content: RichTextContentSchema, canEdit: z.boolean(), canDelete: z.boolean() })
export type Post = z.infer<typeof PostSchema>

export const PostListSchema = z.object({ notices: z.array(PostSummarySchema), posts: z.array(PostSummarySchema), pagination: PaginationSchema })
export type PostList = z.infer<typeof PostListSchema>

export const CommentSchema = z.object({
    id: BoardIdSchema,
    author: AuthorSchema,
    content: z.string(),
    createdAt: z.string(),
    canDelete: z.boolean(),
})
export type Comment = z.infer<typeof CommentSchema>

export const CommentListSchema = z.object({ comments: z.array(CommentSchema), pagination: PaginationSchema })
export type CommentList = z.infer<typeof CommentListSchema>

export const PostCreateInputSchema = z.strictObject({ kind: BoardPostKindSchema, title: PostTitleSchema, content: RichTextContentSchema })
export type PostCreateInput = z.infer<typeof PostCreateInputSchema>

export const PostUpdateInputSchema = z.strictObject({ title: PostTitleSchema, content: RichTextContentSchema })
export type PostUpdateInput = z.infer<typeof PostUpdateInputSchema>

export const CommentCreateInputSchema = z.strictObject({ content: z.string().trim().min(1).max(BOARD_COMMENT_MAX_LENGTH) })
export type CommentCreateInput = z.infer<typeof CommentCreateInputSchema>

export const BoardDeleteResultSchema = z.object({ id: BoardIdSchema })
export type BoardDeleteResult = z.infer<typeof BoardDeleteResultSchema>

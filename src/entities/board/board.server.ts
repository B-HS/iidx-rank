import 'server-only'
import { cacheLife } from 'next/cache'
import {
    BOARD_COMMENTS_PAGE_SIZE,
    BOARD_COMMENT_RATE_LIMIT_MAX,
    BOARD_POSTS_PAGE_SIZE,
    BOARD_POST_KIND,
    BOARD_POST_RATE_LIMIT_MAX,
    BOARD_RATE_LIMIT_WINDOW_MS,
    BoardPageQuerySchema,
    CommentCreateInputSchema,
    CommentListSchema,
    CommentSchema,
    MyBoardActivitySchema,
    PostCreateInputSchema,
    PostListSchema,
    PostSchema,
    PostUpdateInputSchema,
    type BoardPostKind,
    type CommentCreateInput,
    type PostCreateInput,
    type PostUpdateInput,
} from '@entities/board/board.dto'
import {
    countComments,
    countGeneralPosts,
    countRecentComments,
    countRecentPosts,
    deleteComment,
    deletePost,
    insertComment,
    insertPost,
    readCommentRow,
    readCommentRows,
    readGeneralPostRows,
    readMyPostCommentRows,
    readMyPostRows,
    readNoticeRows,
    readPostAccessRow,
    readPostRow,
    readSitemapPostRows,
    updatePost,
} from '@entities/board/board.storage'
import { getCommentExcerpt } from '@entities/board/comment-excerpt'
import { parseRichTextDocument } from '@entities/board/rich-text'
import { ensureUserProfile, toUserSummary } from '@entities/profile/user-summary.server'
import { USER_ROLE } from '@shared/constants/user-role'
import { createPagination } from '@shared/lib/pagination'
import { getSession } from '@shared/server/auth'
import { SITEMAP_CACHE_LIFE, SITEMAP_ENTITY_LIMIT } from '@shared/server/sitemap-cache'

export const getBoardViewer = async () => {
    const session = await getSession()

    return session ? { userId: session.user.id, role: session.user.role } : null
}

export type BoardViewer = NonNullable<Awaited<ReturnType<typeof getBoardViewer>>>
export type BoardFailureReason = 'FORBIDDEN' | 'NOT_FOUND' | 'RATE_LIMITED' | 'INVALID_CONTENT'

type PostSummaryRow = Awaited<ReturnType<typeof readNoticeRows>>[number]
type PostRow = NonNullable<Awaited<ReturnType<typeof readPostRow>>>
type CommentRow = NonNullable<Awaited<ReturnType<typeof readCommentRow>>>

const failure = <Reason extends BoardFailureReason>(reason: Reason) => ({ ok: false as const, reason })

const isAdmin = (viewer: BoardViewer | null) => viewer?.role === USER_ROLE.ADMIN

const canEditPost = (viewer: BoardViewer | null, post: { authorId: string; kind: BoardPostKind }) =>
    post.kind === BOARD_POST_KIND.NOTICE ? isAdmin(viewer) : viewer?.userId === post.authorId

const canDeleteContent = (viewer: BoardViewer | null, authorId: string) => viewer?.userId === authorId || isAdmin(viewer)

const canDeletePost = (viewer: BoardViewer | null, post: { authorId: string; kind: BoardPostKind }) =>
    post.kind === BOARD_POST_KIND.NOTICE ? isAdmin(viewer) : canDeleteContent(viewer, post.authorId)

const getRateLimitWindowStart = () => new Date(Date.now() - BOARD_RATE_LIMIT_WINDOW_MS).toISOString()

const toPostSummary = (row: PostSummaryRow) => ({ ...row, author: toUserSummary(row.author) })

const toPost = (viewer: BoardViewer | null, row: PostRow) => {
    const content: unknown = JSON.parse(row.content)

    return PostSchema.parse({
        ...toPostSummary(row),
        content,
        canEdit: canEditPost(viewer, row),
        canDelete: canDeletePost(viewer, row),
    })
}

const toComment = (viewer: BoardViewer | null, row: CommentRow) => ({
    ...row,
    author: toUserSummary(row.author),
    canDelete: canDeleteContent(viewer, row.authorId),
})

export const getBoardPostList = async (viewer: BoardViewer | null, page: number) => {
    const validatedPage = BoardPageQuerySchema.shape.page.parse(page)
    const viewerId = viewer?.userId ?? null
    const [notices, posts, total] = await Promise.all([readNoticeRows(), readGeneralPostRows(viewerId, validatedPage), countGeneralPosts(viewerId)])

    return PostListSchema.parse({
        notices: notices.map(toPostSummary),
        posts: posts.map(toPostSummary),
        pagination: createPagination(validatedPage, BOARD_POSTS_PAGE_SIZE, total),
    })
}

export const getBoardPost = async (viewer: BoardViewer | null, postId: string) => {
    const row = await readPostRow(postId)

    return row ? toPost(viewer, row) : null
}

export const getBoardCommentList = async (viewer: BoardViewer | null, postId: string, page: number) => {
    const validatedPage = BoardPageQuerySchema.shape.page.parse(page)
    const viewerId = viewer?.userId ?? null

    if (!(await readPostAccessRow(postId))) return null

    const [comments, total] = await Promise.all([readCommentRows(postId, viewerId, validatedPage), countComments(postId, viewerId)])

    return CommentListSchema.parse({
        comments: comments.map((comment) => toComment(viewer, comment)),
        pagination: createPagination(validatedPage, BOARD_COMMENTS_PAGE_SIZE, total),
    })
}

export const getMyBoardActivity = async (viewer: BoardViewer) => {
    const [posts, comments] = await Promise.all([readMyPostRows(viewer.userId), readMyPostCommentRows(viewer.userId)])

    return MyBoardActivitySchema.parse({
        posts: posts.map(toPostSummary),
        comments: comments.map(({ content, ...comment }) => ({
            ...comment,
            author: toUserSummary(comment.author),
            excerpt: getCommentExcerpt(content),
        })),
    })
}

export const publishBoardPost = async (viewer: BoardViewer, input: PostCreateInput) => {
    const { kind, title, content } = PostCreateInputSchema.parse(input)

    if (kind === BOARD_POST_KIND.NOTICE && !isAdmin(viewer)) return failure('FORBIDDEN')

    const parsedContent = parseRichTextDocument(content)

    if (!parsedContent.ok) return failure('INVALID_CONTENT')
    if ((await countRecentPosts(viewer.userId, getRateLimitWindowStart())) >= BOARD_POST_RATE_LIMIT_MAX) return failure('RATE_LIMITED')

    await ensureUserProfile(viewer.userId)

    const id = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    await insertPost({
        id,
        authorId: viewer.userId,
        kind,
        title,
        content: JSON.stringify(parsedContent.document),
        createdAt: timestamp,
        updatedAt: timestamp,
    })

    const row = await readPostRow(id)

    return row ? { ok: true as const, post: toPost(viewer, row) } : failure('NOT_FOUND')
}

export const reviseBoardPost = async (viewer: BoardViewer, postId: string, input: PostUpdateInput) => {
    const { title, content } = PostUpdateInputSchema.parse(input)
    const existing = await readPostAccessRow(postId)

    if (!existing) return failure('NOT_FOUND')
    if (!canEditPost(viewer, existing)) return failure('FORBIDDEN')

    const parsedContent = parseRichTextDocument(content)

    if (!parsedContent.ok) return failure('INVALID_CONTENT')

    await updatePost(postId, { title, content: JSON.stringify(parsedContent.document), updatedAt: new Date().toISOString() })

    const row = await readPostRow(postId)

    return row ? { ok: true as const, post: toPost(viewer, row) } : failure('NOT_FOUND')
}

export const removeBoardPost = async (viewer: BoardViewer, postId: string) => {
    const existing = await readPostAccessRow(postId)

    if (!existing) return failure('NOT_FOUND')
    if (!canDeletePost(viewer, existing)) return failure('FORBIDDEN')

    return (await deletePost(postId)) ? { ok: true as const } : failure('NOT_FOUND')
}

export const addBoardComment = async (viewer: BoardViewer, postId: string, input: CommentCreateInput) => {
    const { content } = CommentCreateInputSchema.parse(input)

    if ((await countRecentComments(viewer.userId, getRateLimitWindowStart())) >= BOARD_COMMENT_RATE_LIMIT_MAX) return failure('RATE_LIMITED')

    await ensureUserProfile(viewer.userId)

    const id = crypto.randomUUID()

    if (!(await insertComment({ id, postId, authorId: viewer.userId, content, createdAt: new Date().toISOString() }))) return failure('NOT_FOUND')

    const row = await readCommentRow(id)

    return row ? { ok: true as const, comment: CommentSchema.parse(toComment(viewer, row)) } : failure('NOT_FOUND')
}

export const removeBoardComment = async (viewer: BoardViewer, commentId: string) => {
    const existing = await readCommentRow(commentId)

    if (!existing) return failure('NOT_FOUND')
    if (!canDeleteContent(viewer, existing.authorId)) return failure('FORBIDDEN')

    return (await deleteComment(commentId)) ? { ok: true as const } : failure('NOT_FOUND')
}

export const getSitemapPosts = async () => {
    'use cache'

    cacheLife(SITEMAP_CACHE_LIFE)

    return await readSitemapPostRows(SITEMAP_ENTITY_LIMIT)
}

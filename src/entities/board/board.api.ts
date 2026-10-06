import {
    BoardDeleteResultSchema,
    BoardIdSchema,
    BoardPageQuerySchema,
    CommentCreateInputSchema,
    CommentListSchema,
    CommentSchema,
    PostCreateInputSchema,
    PostListSchema,
    PostSchema,
    PostUpdateInputSchema,
    type CommentCreateInput,
    type PostCreateInput,
    type PostUpdateInput,
} from '@entities/board/board.dto'
import { apiRequest } from '@shared/lib/api-client'

const POSTS_ENDPOINT = '/api/board/posts'
const COMMENTS_ENDPOINT = '/api/board/comments'

const getPostEndpoint = (postId: string) => `${POSTS_ENDPOINT}/${BoardIdSchema.parse(postId)}`
const getPostCommentsEndpoint = (postId: string) => `${getPostEndpoint(postId)}/comments`
const getPageQuery = (page: number) => `?page=${BoardPageQuerySchema.shape.page.parse(page)}`

export const fetchBoardPosts = (page: number) => apiRequest(`${POSTS_ENDPOINT}${getPageQuery(page)}`, PostListSchema)

export const fetchBoardPost = (postId: string) => apiRequest(getPostEndpoint(postId), PostSchema)

export const fetchBoardComments = (postId: string, page: number) =>
    apiRequest(`${getPostCommentsEndpoint(postId)}${getPageQuery(page)}`, CommentListSchema)

export const createBoardPost = (input: PostCreateInput) =>
    apiRequest(POSTS_ENDPOINT, PostSchema, { method: 'POST', body: JSON.stringify(PostCreateInputSchema.parse(input)) })

export const updateBoardPost = (postId: string, input: PostUpdateInput) =>
    apiRequest(getPostEndpoint(postId), PostSchema, { method: 'PATCH', body: JSON.stringify(PostUpdateInputSchema.parse(input)) })

export const deleteBoardPost = (postId: string) => apiRequest(getPostEndpoint(postId), BoardDeleteResultSchema, { method: 'DELETE' })

export const createBoardComment = (postId: string, input: CommentCreateInput) =>
    apiRequest(getPostCommentsEndpoint(postId), CommentSchema, { method: 'POST', body: JSON.stringify(CommentCreateInputSchema.parse(input)) })

export const deleteBoardComment = (commentId: string) =>
    apiRequest(`${COMMENTS_ENDPOINT}/${BoardIdSchema.parse(commentId)}`, BoardDeleteResultSchema, { method: 'DELETE' })

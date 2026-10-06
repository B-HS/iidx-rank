import { BOARD_POST_MAX_REQUEST_BYTES, BoardIdSchema, PostUpdateInputSchema } from '@entities/board/board.dto'
import { getBoardPost, getBoardViewer, removeBoardPost, reviseBoardPost } from '@entities/board/board.server'
import { successResponse } from '@shared/server/http'
import {
    boardFailureResponse,
    internalErrorResponse,
    parseBoardInput,
    postNotFoundResponse,
    requireBoardWriter,
    validationErrorResponse,
} from '@app/api/board/board-http'

type PostRouteContext = { params: Promise<{ postId: string }> }

export const GET = async (_request: Request, { params }: PostRouteContext) => {
    try {
        const postId = BoardIdSchema.safeParse((await params).postId)

        if (!postId.success) return validationErrorResponse()

        const post = await getBoardPost(await getBoardViewer(), postId.data)

        return post ? successResponse(post) : postNotFoundResponse()
    } catch {
        return internalErrorResponse('게시글을 불러오지 못했습니다.')
    }
}

export const PATCH = async (request: Request, { params }: PostRouteContext) => {
    try {
        const writer = await requireBoardWriter(request)

        if (writer.response) return writer.response

        const postId = BoardIdSchema.safeParse((await params).postId)

        if (!postId.success) return validationErrorResponse()

        const parsed = await parseBoardInput(request, PostUpdateInputSchema, BOARD_POST_MAX_REQUEST_BYTES)

        if (parsed.response) return parsed.response

        const result = await reviseBoardPost(writer.viewer, postId.data, parsed.input)

        return result.ok ? successResponse(result.post) : boardFailureResponse(result.reason, postNotFoundResponse)
    } catch {
        return internalErrorResponse('게시글을 수정하지 못했습니다.')
    }
}

export const DELETE = async (request: Request, { params }: PostRouteContext) => {
    try {
        const writer = await requireBoardWriter(request)

        if (writer.response) return writer.response

        const postId = BoardIdSchema.safeParse((await params).postId)

        if (!postId.success) return validationErrorResponse()

        const result = await removeBoardPost(writer.viewer, postId.data)

        return result.ok ? successResponse({ id: postId.data }) : boardFailureResponse(result.reason, postNotFoundResponse)
    } catch {
        return internalErrorResponse('게시글을 삭제하지 못했습니다.')
    }
}

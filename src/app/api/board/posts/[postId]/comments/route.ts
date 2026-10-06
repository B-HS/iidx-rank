import { BoardIdSchema, CommentCreateInputSchema } from '@entities/board/board.dto'
import { addBoardComment, getBoardCommentList, getBoardViewer } from '@entities/board/board.server'
import { successResponse } from '@shared/server/http'
import {
    boardFailureResponse,
    internalErrorResponse,
    parseBoardInput,
    postNotFoundResponse,
    readPageQuery,
    requireBoardWriter,
    validationErrorResponse,
} from '@app/api/board/board-http'

type CommentsRouteContext = { params: Promise<{ postId: string }> }

export const GET = async (request: Request, { params }: CommentsRouteContext) => {
    try {
        const postId = BoardIdSchema.safeParse((await params).postId)
        const query = readPageQuery(request)

        if (!postId.success || !query.success) return validationErrorResponse()

        const comments = await getBoardCommentList(await getBoardViewer(), postId.data, query.data.page)

        return comments ? successResponse(comments) : postNotFoundResponse()
    } catch {
        return internalErrorResponse('댓글을 불러오지 못했습니다.')
    }
}

export const POST = async (request: Request, { params }: CommentsRouteContext) => {
    try {
        const writer = await requireBoardWriter(request)

        if (writer.response) return writer.response

        const postId = BoardIdSchema.safeParse((await params).postId)

        if (!postId.success) return validationErrorResponse()

        const parsed = await parseBoardInput(request, CommentCreateInputSchema)

        if (parsed.response) return parsed.response

        const result = await addBoardComment(writer.viewer, postId.data, parsed.input)

        return result.ok ? successResponse(result.comment) : boardFailureResponse(result.reason, postNotFoundResponse)
    } catch {
        return internalErrorResponse('댓글을 작성하지 못했습니다.')
    }
}

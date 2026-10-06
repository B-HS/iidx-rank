import { BoardIdSchema } from '@entities/board/board.dto'
import { removeBoardComment } from '@entities/board/board.server'
import { successResponse } from '@shared/server/http'
import {
    boardFailureResponse,
    commentNotFoundResponse,
    internalErrorResponse,
    requireBoardWriter,
    validationErrorResponse,
} from '@app/api/board/board-http'

export const DELETE = async (request: Request, { params }: { params: Promise<{ commentId: string }> }) => {
    try {
        const writer = await requireBoardWriter(request)

        if (writer.response) return writer.response

        const commentId = BoardIdSchema.safeParse((await params).commentId)

        if (!commentId.success) return validationErrorResponse()

        const result = await removeBoardComment(writer.viewer, commentId.data)

        return result.ok ? successResponse({ id: commentId.data }) : boardFailureResponse(result.reason, commentNotFoundResponse)
    } catch {
        return internalErrorResponse('댓글을 삭제하지 못했습니다.')
    }
}

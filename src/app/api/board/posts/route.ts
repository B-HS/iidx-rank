import { BOARD_POST_MAX_REQUEST_BYTES, PostCreateInputSchema } from '@entities/board/board.dto'
import { getBoardPostList, getBoardViewer, publishBoardPost } from '@entities/board/board.server'
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

export const GET = async (request: Request) => {
    try {
        const query = readPageQuery(request)

        if (!query.success) return validationErrorResponse()

        return successResponse(await getBoardPostList(await getBoardViewer(), query.data.page))
    } catch {
        return internalErrorResponse('게시글 목록을 불러오지 못했습니다.')
    }
}

export const POST = async (request: Request) => {
    try {
        const writer = await requireBoardWriter(request)

        if (writer.response) return writer.response

        const parsed = await parseBoardInput(request, PostCreateInputSchema, BOARD_POST_MAX_REQUEST_BYTES)

        if (parsed.response) return parsed.response

        const result = await publishBoardPost(writer.viewer, parsed.input)

        return result.ok ? successResponse(result.post) : boardFailureResponse(result.reason, postNotFoundResponse)
    } catch {
        return internalErrorResponse('게시글을 작성하지 못했습니다.')
    }
}

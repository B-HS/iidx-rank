import { z } from 'zod'
import { BoardPageQuerySchema } from '@entities/board/board.dto'
import { getBoardViewer, type BoardFailureReason } from '@entities/board/board.server'
import { API_STATUS, errorResponse, isTrustedOrigin } from '@shared/server/http'
import { parseJsonInput } from '@shared/server/parse-json-input'

const BOARD_FAILURE_RESPONSES: Record<Exclude<BoardFailureReason, 'NOT_FOUND'>, { code: string; message: string; status: number }> = {
    FORBIDDEN: { code: 'FORBIDDEN', message: '이 작업을 수행할 권한이 없습니다.', status: API_STATUS.FORBIDDEN },
    RATE_LIMITED: { code: 'RATE_LIMITED', message: '작성이 너무 잦습니다. 잠시 후 다시 시도해 주세요.', status: API_STATUS.TOO_MANY_REQUESTS },
    INVALID_CONTENT: { code: 'INVALID_CONTENT', message: '본문 형식이 올바르지 않습니다.', status: API_STATUS.BAD_REQUEST },
}

export const postNotFoundResponse = () => errorResponse('POST_NOT_FOUND', '게시글을 찾을 수 없습니다.', API_STATUS.NOT_FOUND)

export const commentNotFoundResponse = () => errorResponse('COMMENT_NOT_FOUND', '댓글을 찾을 수 없습니다.', API_STATUS.NOT_FOUND)

export const validationErrorResponse = () => errorResponse('VALIDATION_ERROR', '입력값이 올바르지 않습니다.', API_STATUS.BAD_REQUEST)

export const internalErrorResponse = (message: string) => errorResponse('INTERNAL_ERROR', message, API_STATUS.INTERNAL_SERVER_ERROR)

export const boardFailureResponse = (reason: BoardFailureReason, notFoundResponse: () => Response) => {
    if (reason === 'NOT_FOUND') return notFoundResponse()

    const { code, message, status } = BOARD_FAILURE_RESPONSES[reason]

    return errorResponse(code, message, status)
}

export const requireBoardWriter = async (request: Request) => {
    if (!isTrustedOrigin(request.headers.get('origin')))
        return { response: errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN) }

    const viewer = await getBoardViewer()

    if (!viewer) return { response: errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED) }

    return { viewer }
}

export const parseBoardInput = async <Output>(request: Request, schema: z.ZodType<Output>, maxBytes?: number) => {
    const parsed = await parseJsonInput(request, z.unknown(), maxBytes)

    if (parsed.response) return { response: parsed.response }

    const input = schema.safeParse(parsed.input)

    return input.success ? { input: input.data } : { response: validationErrorResponse() }
}

export const readPageQuery = (request: Request) => {
    const page = new URL(request.url).searchParams.get('page') ?? undefined

    return BoardPageQuerySchema.safeParse({ page })
}

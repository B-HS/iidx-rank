import { getBoardViewer, getMyBoardActivity } from '@entities/board/board.server'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'
import { internalErrorResponse } from '@app/api/board/board-http'

export const GET = async () => {
    try {
        const viewer = await getBoardViewer()

        if (!viewer) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        return successResponse(await getMyBoardActivity(viewer))
    } catch {
        return internalErrorResponse('내 게시판 활동을 불러오지 못했습니다.')
    }
}

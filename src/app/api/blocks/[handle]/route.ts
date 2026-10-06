import { blockUser, unblockUser, type BlockFailureReason } from '@entities/block/block.server'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'

type BlockRouteContext = { params: Promise<{ handle: string }> }

const BLOCK_FAILURE_RESPONSES: Record<BlockFailureReason, { code: string; message: string; status: number }> = {
    USER_NOT_FOUND: { code: 'USER_NOT_FOUND', message: '사용자를 찾을 수 없습니다.', status: API_STATUS.NOT_FOUND },
    SELF_TARGET: { code: 'VALIDATION_ERROR', message: '자기 자신은 차단할 수 없습니다.', status: API_STATUS.BAD_REQUEST },
}

const changeBlock = async (request: Request, { params }: BlockRouteContext, change: typeof blockUser) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin')))
            return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)

        const handle = HandleSchema.safeParse((await params).handle)

        if (!handle.success) return errorResponse('VALIDATION_ERROR', '핸들 형식이 올바르지 않습니다.', API_STATUS.BAD_REQUEST)

        const result = await change(session.user.id, handle.data)

        if (!result.ok) {
            const { code, message, status } = BLOCK_FAILURE_RESPONSES[result.reason]
            return errorResponse(code, message, status)
        }

        return successResponse(result.list)
    } catch {
        return errorResponse('INTERNAL_ERROR', '차단 설정을 변경하지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

export const PUT = async (request: Request, context: BlockRouteContext) => await changeBlock(request, context, blockUser)

export const DELETE = async (request: Request, context: BlockRouteContext) => await changeBlock(request, context, unblockUser)

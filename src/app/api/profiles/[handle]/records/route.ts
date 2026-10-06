import { getProfileRecords } from '@entities/profile/profile.server'
import { HandleSchema } from '@entities/profile/user-summary.dto'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, successResponse } from '@shared/server/http'

const notFoundResponse = () => errorResponse('PROFILE_NOT_FOUND', '프로필을 찾을 수 없습니다.', API_STATUS.NOT_FOUND)

export const GET = async (_request: Request, { params }: { params: Promise<{ handle: string }> }) => {
    try {
        const { handle } = await params
        const parsedHandle = HandleSchema.safeParse(handle)

        if (!parsedHandle.success) return notFoundResponse()

        const session = await getSession()
        const records = await getProfileRecords(parsedHandle.data, session?.user.id ?? null)

        if (!records) return notFoundResponse()

        return successResponse(records)
    } catch {
        return errorResponse('PROFILE_UNAVAILABLE', '플레이 기록을 불러오지 못했습니다.', API_STATUS.SERVICE_UNAVAILABLE)
    }
}

import { z } from 'zod'
import { FilePurposeSchema, MAX_UPLOAD_REQUEST_BYTES } from '@entities/file/file.dto'
import { saveUploadedImage, type UploadFailureReason } from '@entities/file/file.server'
import { getSession } from '@shared/server/auth'
import { API_STATUS, errorResponse, isTrustedOrigin, successResponse } from '@shared/server/http'
import { isR2Configured } from '@shared/server/r2'

const MULTIPART_CONTENT_TYPE = 'multipart/form-data'

const UploadFormSchema = z.object({ file: z.instanceof(File), purpose: FilePurposeSchema })

const readFormData = async (request: Request) => {
    try {
        return await request.formData()
    } catch {
        return null
    }
}

const UPLOAD_FAILURE_RESPONSES: Record<UploadFailureReason, { code: string; message: string; status: number }> = {
    TOO_LARGE: { code: 'PAYLOAD_TOO_LARGE', message: '파일 크기가 너무 큽니다.', status: API_STATUS.PAYLOAD_TOO_LARGE },
    UNSUPPORTED_TYPE: { code: 'UNSUPPORTED_MEDIA_TYPE', message: '지원하지 않는 이미지 형식입니다.', status: API_STATUS.UNSUPPORTED_MEDIA_TYPE },
    RATE_LIMITED: { code: 'RATE_LIMITED', message: '업로드가 너무 잦습니다. 잠시 후 다시 시도해 주세요.', status: API_STATUS.TOO_MANY_REQUESTS },
    STORAGE_UNAVAILABLE: { code: 'FILE_STORAGE_UNAVAILABLE', message: '파일 저장소를 사용할 수 없습니다.', status: API_STATUS.SERVICE_UNAVAILABLE },
}

export const POST = async (request: Request) => {
    try {
        if (!isTrustedOrigin(request.headers.get('origin')))
            return errorResponse('ORIGIN_NOT_ALLOWED', '허용되지 않은 출처의 요청입니다.', API_STATUS.FORBIDDEN)

        const session = await getSession()

        if (!session) return errorResponse('AUTH_REQUIRED', '로그인 후 이용해 주세요.', API_STATUS.UNAUTHORIZED)
        if (!isR2Configured()) return errorResponse('FILE_STORAGE_UNAVAILABLE', '파일 저장소를 사용할 수 없습니다.', API_STATUS.SERVICE_UNAVAILABLE)

        const contentLength = request.headers.get('content-length')

        if (contentLength !== null && Number(contentLength) > MAX_UPLOAD_REQUEST_BYTES)
            return errorResponse('PAYLOAD_TOO_LARGE', '파일 크기가 너무 큽니다.', API_STATUS.PAYLOAD_TOO_LARGE)

        if (!request.headers.get('content-type')?.toLowerCase().startsWith(MULTIPART_CONTENT_TYPE))
            return errorResponse('UNSUPPORTED_MEDIA_TYPE', 'multipart/form-data 형식으로 요청해 주세요.', API_STATUS.UNSUPPORTED_MEDIA_TYPE)

        const formData = await readFormData(request)
        const parsed = UploadFormSchema.safeParse({ file: formData?.get('file'), purpose: formData?.get('purpose') })

        if (!parsed.success) return errorResponse('VALIDATION_ERROR', '파일과 용도를 올바르게 보내 주세요.', API_STATUS.BAD_REQUEST)

        const result = await saveUploadedImage(session.user.id, parsed.data.purpose, parsed.data.file)

        if (!result.ok) {
            const { code, message, status } = UPLOAD_FAILURE_RESPONSES[result.reason]
            return errorResponse(code, message, status)
        }

        return successResponse({ key: result.key, url: result.url })
    } catch {
        return errorResponse('INTERNAL_ERROR', '파일을 업로드하지 못했습니다.', API_STATUS.INTERNAL_SERVER_ERROR)
    }
}

import { UploadResponseSchema, type FilePurpose } from '@entities/file/file.dto'
import { apiRequest } from '@shared/lib/api-client'

export const uploadImage = (file: File, purpose: FilePurpose) => {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('purpose', purpose)

    return apiRequest('/api/files', UploadResponseSchema, { method: 'POST', body: formData })
}

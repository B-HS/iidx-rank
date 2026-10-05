import { toNextJsHandler } from 'better-auth/next-js'
import { getAuth } from '@shared/server/auth'
import { API_STATUS } from '@shared/server/http'

const PRIVATE_AUTH_HEADERS = {
    'Cache-Control': 'private, no-store',
    Pragma: 'no-cache',
}

const withPrivateAuthHeaders = (response: Response) => {
    const headers = new Headers(response.headers)
    const setCookieHeaders = response.headers.getSetCookie()

    headers.delete('set-cookie')

    for (const setCookieHeader of setCookieHeaders) headers.append('set-cookie', setCookieHeader)

    headers.set('Cache-Control', PRIVATE_AUTH_HEADERS['Cache-Control'])
    headers.set('Pragma', PRIVATE_AUTH_HEADERS.Pragma)

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    })
}

const handleAuthRequest = async (method: 'GET' | 'POST', request: Request) => {
    try {
        const handlers = toNextJsHandler(getAuth())
        const response = method === 'GET' ? await handlers.GET(request) : await handlers.POST(request)

        return withPrivateAuthHeaders(response)
    } catch {
        return Response.json(
            { message: '인증 서비스를 사용할 수 없습니다.' },
            { status: API_STATUS.SERVICE_UNAVAILABLE, headers: PRIVATE_AUTH_HEADERS },
        )
    }
}

export const GET = async (request: Request) => await handleAuthRequest('GET', request)

export const POST = async (request: Request) => await handleAuthRequest('POST', request)

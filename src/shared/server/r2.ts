import 'server-only'
import { AwsClient } from 'aws4fetch'
import { getEnv } from '@shared/server/env'

const R2_SERVICE = 's3'
const R2_REGION = 'auto'
const R2_MAX_RETRIES = 2
const TRAILING_SLASHES_PATTERN = /\/+$/

export const R2_OBJECT_CACHE_CONTROL = 'public, max-age=31536000, immutable'

type R2Connection = { client: AwsClient; baseUrl: string }

let connection: R2Connection | undefined

const getConnection = () => {
    if (connection) return connection

    const { R2_ACCESS_KEY, R2_SECRET_KEY, R2_URL } = getEnv()

    if (!R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_URL) return null

    connection = {
        client: new AwsClient({
            accessKeyId: R2_ACCESS_KEY,
            secretAccessKey: R2_SECRET_KEY,
            service: R2_SERVICE,
            region: R2_REGION,
            retries: R2_MAX_RETRIES,
        }),
        baseUrl: R2_URL.replace(TRAILING_SLASHES_PATTERN, ''),
    }

    return connection
}

const requireConnection = () => {
    const current = getConnection()

    if (!current) throw new Error('R2 storage is not configured')

    return current
}

export const isR2Configured = () => getConnection() !== null

export const putR2Object = async (key: string, body: ArrayBuffer, contentType: string) => {
    const { client, baseUrl } = requireConnection()
    const response = await client.fetch(`${baseUrl}/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': contentType, 'Cache-Control': R2_OBJECT_CACHE_CONTROL },
        body,
    })

    if (!response.ok) throw new Error(`R2 PUT failed with status ${response.status}`)
}

export const getR2Object = async (key: string) => {
    const { client, baseUrl } = requireConnection()

    return await client.fetch(`${baseUrl}/${key}`, { method: 'GET' })
}

export const deleteR2Object = async (key: string) => {
    const { client, baseUrl } = requireConnection()
    const response = await client.fetch(`${baseUrl}/${key}`, { method: 'DELETE' })

    if (!response.ok && response.status !== 404) throw new Error(`R2 DELETE failed with status ${response.status}`)
}

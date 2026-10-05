import { syncCatalogFromSource } from '@entities/catalog/catalog.storage'
import { getDb } from '@shared/server/db/get-db'

try {
    const database = getDb()
    try {
        const source = await syncCatalogFromSource()
        process.stdout.write(JSON.stringify(source, null, 2) + '\n')
    } finally {
        database.$client.close()
    }
} catch {
    process.stderr.write('곡 목록 원본 동기화에 실패했습니다.\n')
    process.exitCode = 1
}

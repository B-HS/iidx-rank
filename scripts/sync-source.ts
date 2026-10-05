import { syncCatalogFromSource } from '@entities/catalog/catalog.storage'

try {
    const source = await syncCatalogFromSource()
    process.stdout.write(JSON.stringify(source, null, 2) + '\n')
} catch {
    process.stderr.write('곡 목록 원본 동기화에 실패했습니다.\n')
    process.exitCode = 1
}

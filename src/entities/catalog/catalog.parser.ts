import { createHash } from 'node:crypto'
import { isTag, isText, type AnyNode } from 'domhandler'
import { load, type CheerioAPI } from 'cheerio'
import { CatalogSchema, DIFFICULTIES, RANKS, type Catalog, type Chart } from '@entities/catalog/catalog.dto'

const SOURCE_BASE_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUdp6iuEzE8Z5AL1hkoxzLexp89nJnLQMmICm6_MC0_UjCp1ImZFzabcZkvCpK7mcWvm_2t6iYoJRg'
const NORMAL_SOURCE_URL = SOURCE_BASE_URL + '/pubhtml/sheet?headers=false&gid=1873149697'
const HARD_SOURCE_URL = SOURCE_BASE_URL + '/pubhtml/sheet?headers=false&gid=0'
const INTRO_SOURCE_URL = SOURCE_BASE_URL + '/pubhtml/sheet?headers=false&gid=1525735813'
const MAX_SOURCE_HTML_BYTES = 1_000_000
const MAX_CELL_SPAN = 64
const FIRST_VERSION_COLUMN_INDEX = 2
const TRAILING_LABEL_COLUMN_COUNT = 1
const CHART_ID_HASH_LENGTH = 32
const RED_COLORS = new Set(['#ff0000', 'rgb(255, 0, 0)'])
const SOURCE_TITLE_ALIASES = new Map([['Life Is A Game ft.DD"ナカタ"Metal"', 'Life Is A Game ft.DD"ナカタ"Metal']])

type SourceChart = Pick<Chart, 'title' | 'difficulty' | 'version'> & {
    rank: NonNullable<Chart['normalRank']>
    personal: boolean
}
type TextRun = {
    text: string
    color: string | null
}
type CatalogSourceMode = {
    charts: Map<string, SourceChart>
    expectedCount: number
}

export class CatalogParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CatalogParseError'
    }
}

const normalizeRank = (value: string) => value.normalize('NFKC').trim().toUpperCase()

const normalizeTitleKey = (title: string) => {
    const normalized = title
        .normalize('NFKC')
        .replace(/[〜～∼]/g, '~')
        .replace(/\s+/g, ' ')
        .trim()

    return SOURCE_TITLE_ALIASES.get(normalized) ?? normalized
}

const cssColor = (declaration: string) => {
    const match = declaration.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i)
    return (
        match?.[1]
            ?.trim()
            .toLowerCase()
            .replace(/\s*!important\s*$/i, '') ?? null
    )
}

const classColors = ($: CheerioAPI) => {
    const rules = new Map<string, string>()
    const styleText = $('style')
        .toArray()
        .map((style) => $(style).text())
        .join('\n')

    for (const match of styleText.matchAll(/\.([a-z][\w-]*)\s*\{([^}]*)\}/gi)) {
        const color = cssColor(match[2] ?? '')
        if (match[1] !== undefined && color !== null) {
            rules.set(match[1], color)
        }
    }

    return rules
}

const nodeColor = (node: AnyNode, inheritedColor: string | null, colors: Map<string, string>) => {
    if (!isTag(node)) {
        return inheritedColor
    }

    let color = inheritedColor
    const classNames = node.attribs.class?.split(/\s+/) ?? []

    for (const className of classNames) {
        color = colors.get(className) ?? color
    }

    return cssColor(node.attribs.style ?? '') ?? color
}

const collectRuns = (node: AnyNode, inheritedColor: string | null, colors: Map<string, string>, lines: TextRun[][]) => {
    if (isText(node)) {
        if (node.data !== '') {
            lines.at(-1)?.push({ text: node.data, color: inheritedColor })
        }
        return
    }

    if (!isTag(node)) {
        return
    }

    if (node.name.toLowerCase() === 'br') {
        lines.push([])
        return
    }

    const color = nodeColor(node, inheritedColor, colors)
    for (const child of node.children) {
        collectRuns(child, color, colors, lines)
    }
}

const extractLines = (cell: AnyNode, colors: Map<string, string>) => {
    const lines: TextRun[][] = [[]]
    const color = nodeColor(cell, null, colors)

    if (isTag(cell)) {
        for (const child of cell.children) {
            collectRuns(child, color, colors, lines)
        }
    }

    return lines
        .map((runs) => {
            const text = runs.map((run) => run.text).join('')
            const trimmed = text.trim()
            const start = text.length - text.trimStart().length
            const suffix = trimmed.match(/\[(H|L)\]$/i)
            const title = suffix === null ? trimmed : trimmed.slice(0, -suffix[0].length).trim()
            const titleStart = start
            const titleEnd = start + (suffix === null ? trimmed.length : trimmed.lastIndexOf(suffix[0]))
            let offset = 0
            const personal = runs.some((run) => {
                const runStart = offset
                offset += run.text.length
                if (run.color === null || !RED_COLORS.has(run.color) || runStart >= titleEnd || runStart + run.text.length <= titleStart) {
                    return false
                }
                return run.text.trim() !== ''
            })

            return { title, difficulty: suffix?.[1]?.toUpperCase() ?? 'A', personal }
        })
        .filter((line) => line.title !== '')
}

const expandedCells = ($: CheerioAPI, row: AnyNode) => {
    const logicalCells: AnyNode[] = []

    for (const cell of $(row).children('td,th').toArray()) {
        const rawSpan = $(cell).attr('colspan')
        const span = rawSpan === undefined ? 1 : Number.parseInt(rawSpan, 10)

        if (!Number.isSafeInteger(span) || span < 1 || span > MAX_CELL_SPAN) {
            throw new CatalogParseError('원본 표의 셀 병합 구조를 해석할 수 없습니다.')
        }

        for (let index = 0; index < span; index += 1) {
            logicalCells.push(cell)
        }
    }

    return logicalCells
}

const canonicalChartId = (title: string, difficulty: string) =>
    'chart-' +
    createHash('sha256')
        .update(normalizeTitleKey(title) + '\0' + difficulty)
        .digest('hex')
        .slice(0, CHART_ID_HASH_LENGTH)

const parseSourceMode = (html: string): CatalogSourceMode => {
    if (Buffer.byteLength(html, 'utf8') > MAX_SOURCE_HTML_BYTES) {
        throw new CatalogParseError('원본 표 크기가 허용 한도를 넘었습니다.')
    }

    const $ = load(html)
    const table = $('table.waffle').first()
    if (table.length === 0) {
        throw new CatalogParseError('원본 표를 찾을 수 없습니다.')
    }

    const rows = table.find('tr').toArray()
    const colors = classColors($)
    let headerRow: AnyNode | undefined
    let expectedCount: number | undefined

    for (const row of rows) {
        const cells = expandedCells($, row)
        const countCell = cells.find((cell) => $(cell).text().normalize('NFKC').includes('譜面'))
        const countMatch =
            countCell === undefined
                ? null
                : $(countCell)
                      .text()
                      .normalize('NFKC')
                      .match(/(\d+)\s*譜面/)
        if (countMatch !== null) {
            const count = Number.parseInt(countMatch[1] ?? '', 10)
            if (!Number.isSafeInteger(count) || count < 1 || expectedCount !== undefined) {
                throw new CatalogParseError('원본 표의 표시 곡 수가 올바르지 않습니다.')
            }
            expectedCount = count
            headerRow = row
        }
    }

    if (headerRow === undefined || expectedCount === undefined) {
        throw new CatalogParseError('원본 표의 곡 수 헤더가 없습니다.')
    }

    const headerCells = expandedCells($, headerRow)
    const versionByColumn = new Map<number, string>()

    for (let column = FIRST_VERSION_COLUMN_INDEX; column < headerCells.length - TRAILING_LABEL_COLUMN_COUNT; column += 1) {
        const version = $(headerCells[column]).text().trim()
        if (version !== '') {
            versionByColumn.set(column, version)
        }
    }

    if (versionByColumn.size === 0) {
        throw new CatalogParseError('원본 표의 버전 헤더를 찾을 수 없습니다.')
    }

    const charts = new Map<string, SourceChart>()
    const rankRows: string[] = []

    for (const row of rows) {
        if (row === headerRow) {
            continue
        }

        const cells = expandedCells($, row)
        if (cells.length < 4) {
            continue
        }

        const rankText = normalizeRank($(cells[1]).text())
        const rank = RANKS.find((candidate) => candidate === rankText)
        if (rank === undefined) {
            continue
        }

        const mirroredRank = normalizeRank($(cells.at(-1)).text())
        if (mirroredRank !== rank) {
            throw new CatalogParseError('원본 표의 양쪽 난이도 표기가 일치하지 않습니다.')
        }

        rankRows.push(rank)
        const seenCells = new Set<AnyNode>()

        for (let column = FIRST_VERSION_COLUMN_INDEX; column < cells.length - TRAILING_LABEL_COLUMN_COUNT; column += 1) {
            const version = versionByColumn.get(column)
            const cell = cells[column]
            if (cell === undefined || seenCells.has(cell)) {
                continue
            }
            seenCells.add(cell)

            if (version === undefined) {
                if ($(cell).text().trim() !== '') {
                    throw new CatalogParseError('버전이 없는 열에서 곡을 찾았습니다.')
                }
                continue
            }

            const lines = extractLines(cell, colors)
            for (const line of lines) {
                const difficulty = DIFFICULTIES.find((candidate) => candidate === line.difficulty.normalize('NFKC'))
                if (difficulty === undefined) {
                    throw new CatalogParseError('곡의 난이도 접미사를 해석할 수 없습니다.')
                }

                const id = canonicalChartId(line.title, difficulty)
                if (charts.has(id)) {
                    throw new CatalogParseError('원본 표에 중복된 곡이 있습니다.')
                }

                charts.set(id, {
                    title: line.title,
                    difficulty,
                    version,
                    rank,
                    personal: line.personal,
                })
            }
        }
    }

    const expectedRanks = [...RANKS]
    if (rankRows.length !== expectedRanks.length || rankRows.some((rank, index) => rank !== expectedRanks[index])) {
        throw new CatalogParseError('원본 표의 난이도 행이 누락되었거나 순서가 잘못되었습니다.')
    }

    if (charts.size !== expectedCount) {
        throw new CatalogParseError('원본 표의 표시 곡 수와 실제 곡 수가 다릅니다.')
    }

    return { charts, expectedCount }
}

const parseUpdatedAt = (html: string) => {
    if (Buffer.byteLength(html, 'utf8') > MAX_SOURCE_HTML_BYTES) {
        throw new CatalogParseError('원본 안내 표 크기가 허용 한도를 넘었습니다.')
    }

    const $ = load(html)
    const text = $('table.waffle').first().text().normalize('NFKC')
    const match = text.match(/最終更新\s*(\d{4})\s*[/-]\s*(\d{1,2})\s*[/-]\s*(\d{1,2})/)
    if (match === null) {
        return null
    }

    const year = Number.parseInt(match[1] ?? '', 10)
    const month = Number.parseInt(match[2] ?? '', 10)
    const day = Number.parseInt(match[3] ?? '', 10)
    const parsed = new Date(Date.UTC(year, month - 1, day))
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
        throw new CatalogParseError('원본 표의 갱신일을 해석할 수 없습니다.')
    }

    return parsed.toISOString().slice(0, 10)
}

export const parseCatalogSources = (normalHtml: string, hardHtml: string, introHtml: string, fetchedAt = new Date().toISOString()): Catalog => {
    const fetchedAtResult = CatalogSchema.shape.source.shape.fetchedAt.parse(fetchedAt)
    if (fetchedAtResult === null) {
        throw new CatalogParseError('수집 시간이 올바르지 않습니다.')
    }

    const normal = parseSourceMode(normalHtml)
    const hard = parseSourceMode(hardHtml)
    if (normal.expectedCount !== hard.expectedCount) {
        throw new CatalogParseError('노마게와 하드 표의 표시 곡 수가 다릅니다.')
    }

    const merged = new Map<string, Chart>()
    for (const [id, chart] of normal.charts) {
        merged.set(id, {
            id,
            title: chart.title,
            difficulty: chart.difficulty,
            version: chart.version,
            normalRank: chart.rank,
            hardRank: hard.charts.get(id)?.rank ?? null,
            normalPersonal: chart.personal,
            hardPersonal: hard.charts.get(id)?.personal ?? false,
        })
    }

    for (const [id, chart] of hard.charts) {
        const existing = merged.get(id)
        if (existing !== undefined) {
            if (existing.version !== chart.version) {
                throw new CatalogParseError('같은 곡의 원본 버전 표기가 서로 다릅니다.')
            }
            merged.set(id, { ...existing, hardRank: chart.rank, hardPersonal: chart.personal })
            continue
        }

        merged.set(id, {
            id,
            title: chart.title,
            difficulty: chart.difficulty,
            version: chart.version,
            normalRank: null,
            hardRank: chart.rank,
            normalPersonal: false,
            hardPersonal: chart.personal,
        })
    }

    if (merged.size !== normal.expectedCount) {
        throw new CatalogParseError('노마게와 하드 표의 곡 구성이 서로 다릅니다.')
    }

    return CatalogSchema.parse({
        charts: [...merged.values()],
        source: {
            updatedAt: parseUpdatedAt(introHtml),
            fetchedAt: fetchedAtResult,
            chartCount: merged.size,
            status: merged.size === 0 ? 'empty' : 'ready',
            url: NORMAL_SOURCE_URL,
        },
    })
}

export const CATALOG_SOURCE_URLS = {
    normal: NORMAL_SOURCE_URL,
    hard: HARD_SOURCE_URL,
    intro: INTRO_SOURCE_URL,
} as const

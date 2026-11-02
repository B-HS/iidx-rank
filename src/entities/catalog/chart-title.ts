import { createHash } from 'node:crypto'

const CHART_ID_HASH_LENGTH = 32
const TITLE_TILDE_VARIANTS = /[〜～∼]/g
const TITLE_LATIN_MARKS = /(\p{Script=Latin})\p{M}+/gu
const TITLE_DECORATIONS = /\p{So}+/gu

const SOURCE_TITLE_ALIASES = new Map([['Life Is A Game ft.DD"ナカタ"Metal"', 'Life Is A Game ft.DD"ナカタ"Metal']])

/**
 * e-amusement와 난이도표가 글자 자체를 다르게 적는 곡입니다.
 * 焱影은 SINOBUZ 공식 사이트와 결과 화면에서 火影으로 잘못 표기된 이력이 있습니다.
 * 왼쪽이 가져오기에서 오는 표기, 오른쪽이 난이도표 표기입니다.
 */
const TITLE_MATCH_ALIASES: ReadonlyArray<readonly [source: string, catalog: string]> = [['火影', '焱影']]

/**
 * 난이도표 원본을 chartId로 바꾸는 키입니다.
 * 익스텐션과 이미 저장된 chartId가 이 규칙을 공유하므로 계산식을 바꾸면 기존 기록이 끊깁니다.
 */
export const normalizeTitleKey = (title: string) => {
    const normalized = title.normalize('NFKC').replace(TITLE_TILDE_VARIANTS, '~').replace(/\s+/g, ' ').trim()

    return SOURCE_TITLE_ALIASES.get(normalized) ?? normalized
}

/**
 * 출처가 다른 곡명을 같은 곡으로 비교하는 키입니다.
 * 장식 기호·라틴 발음기호·공백처럼 표기만 다른 차이를 없애고, 가나의 탁점은 그대로 둡니다.
 */
export const normalizeTitleMatchKey = (title: string) =>
    title
        .normalize('NFKD')
        .replace(TITLE_LATIN_MARKS, '$1')
        .normalize('NFC')
        .replace(TITLE_TILDE_VARIANTS, '~')
        .replace(TITLE_DECORATIONS, '')
        .replace(/\s+/g, '')
        .trim()
        .toUpperCase()

const MATCH_TITLE_ALIAS_MAP = new Map(
    TITLE_MATCH_ALIASES.map(([source, catalog]) => [normalizeTitleMatchKey(source), normalizeTitleMatchKey(catalog)]),
)

export const chartMatchKey = (title: string, difficulty: string) => {
    const key = normalizeTitleMatchKey(title)

    return (MATCH_TITLE_ALIAS_MAP.get(key) ?? key) + '\0' + difficulty
}

export const canonicalChartId = (title: string, difficulty: string) =>
    'chart-' +
    createHash('sha256')
        .update(normalizeTitleKey(title) + '\0' + difficulty)
        .digest('hex')
        .slice(0, CHART_ID_HASH_LENGTH)

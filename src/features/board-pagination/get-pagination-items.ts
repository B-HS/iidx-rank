const FIRST_PAGE = 1
const SIBLING_PAGE_COUNT = 1
const SINGLE_HIDDEN_PAGE_GAP = 2

type PaginationItem = { kind: 'page'; page: number } | { kind: 'ellipsis'; key: string }

const toPageItem = (page: number): PaginationItem => ({ kind: 'page', page })
const toEllipsisItem = (nextPage: number): PaginationItem => ({ kind: 'ellipsis', key: `before-${nextPage}` })

/**
 * Builds the visible pagination entries: first and last page, the pages around the current one, and ellipses for skipped ranges.
 * @param page - current page, clamped into the valid range
 * @param totalPages - total number of pages
 */
export const getPaginationItems = (page: number, totalPages: number) => {
    if (totalPages < FIRST_PAGE) return []

    const currentPage = Math.min(Math.max(page, FIRST_PAGE), totalPages)
    const windowStart = Math.max(currentPage - SIBLING_PAGE_COUNT, FIRST_PAGE)
    const windowEnd = Math.min(currentPage + SIBLING_PAGE_COUNT, totalPages)
    const windowPages = Array.from({ length: windowEnd - windowStart + 1 }, (_, index) => windowStart + index)
    const visiblePages = [...new Set([FIRST_PAGE, ...windowPages, totalPages])]

    return visiblePages.flatMap((visiblePage, index) => {
        const gap = index === 0 ? 1 : visiblePage - visiblePages[index - 1]

        if (gap === SINGLE_HIDDEN_PAGE_GAP) return [toPageItem(visiblePage - 1), toPageItem(visiblePage)]
        if (gap > SINGLE_HIDDEN_PAGE_GAP) return [toEllipsisItem(visiblePage), toPageItem(visiblePage)]

        return [toPageItem(visiblePage)]
    })
}

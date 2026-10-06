'use client'
import type { FC } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { BoardPaginationControl } from '@features/board-pagination/board-pagination-control'
import { getPaginationItems } from '@features/board-pagination/get-pagination-items'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@shared/ui/pagination'

type BoardPaginationProps = {
    page: number
    totalPages: number
    label: string
    className?: string
} & ({ getHref: (page: number) => string } | { onPageChange: (page: number) => void })

const FIRST_PAGE = 1

export const BoardPagination: FC<BoardPaginationProps> = ({ page, totalPages, label, className, ...navigation }) => {
    const t = useTranslations('board')

    if (totalPages <= FIRST_PAGE) return null

    const currentPage = Math.min(Math.max(page, FIRST_PAGE), totalPages)
    const getTarget = (targetPage: number) =>
        'getHref' in navigation ? { href: navigation.getHref(targetPage) } : { onSelect: () => navigation.onPageChange(targetPage) }

    return (
        <Pagination aria-label={label} className={className}>
            <PaginationContent className='flex-wrap justify-center'>
                <PaginationItem>
                    <BoardPaginationControl
                        target={getTarget(Math.max(currentPage - 1, FIRST_PAGE))}
                        label={t('paginationPrevious')}
                        isDisabled={page <= FIRST_PAGE}>
                        <ChevronLeft aria-hidden='true' />
                    </BoardPaginationControl>
                </PaginationItem>
                {getPaginationItems(page, totalPages).map((item) => (
                    <PaginationItem key={item.kind === 'page' ? item.page : item.key}>
                        {item.kind === 'page' ? (
                            <BoardPaginationControl
                                target={getTarget(item.page)}
                                label={t('paginationPage', { page: item.page })}
                                isActive={item.page === page}>
                                {item.page}
                            </BoardPaginationControl>
                        ) : (
                            <PaginationEllipsis />
                        )}
                    </PaginationItem>
                ))}
                <PaginationItem>
                    <BoardPaginationControl
                        target={getTarget(Math.min(currentPage + 1, totalPages))}
                        label={t('paginationNext')}
                        isDisabled={page >= totalPages}>
                        <ChevronRight aria-hidden='true' />
                    </BoardPaginationControl>
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}

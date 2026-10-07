'use client'
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@shared/lib/utils'

type FittedRowListProps = {
    rows: readonly { id: string; content: ReactNode }[]
    rowClassName: string
    label: string
    className?: string
}

const ROW_FIT_TOLERANCE_PX = 1

export const FittedRowList: FC<FittedRowListProps> = ({ rows, rowClassName, label, className }) => {
    const listRef = useRef<HTMLUListElement>(null)
    const [visibleCount, setVisibleCount] = useState<number | null>(null)
    const hasRows = rows.length > 0

    useEffect(() => {
        const list = listRef.current

        if (!list || !hasRows) return

        const observer = new ResizeObserver(() => {
            const rowHeight = list.firstElementChild?.getBoundingClientRect().height ?? 0

            setVisibleCount(rowHeight > 0 ? Math.floor((list.clientHeight + ROW_FIT_TOLERANCE_PX) / rowHeight) : null)
        })

        observer.observe(list)

        return () => observer.disconnect()
    }, [hasRows])

    return (
        <ul ref={listRef} aria-label={label} className={cn('flex min-h-0 min-w-0 flex-col flex-wrap content-start overflow-hidden', className)}>
            {rows.map((row, index) => (
                <li key={row.id} inert={visibleCount !== null && index >= visibleCount} className={cn('w-full min-w-0 shrink-0', rowClassName)}>
                    {row.content}
                </li>
            ))}
        </ul>
    )
}

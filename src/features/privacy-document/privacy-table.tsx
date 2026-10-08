import type { FC, ReactNode } from 'react'
import { cn } from '@shared/lib/utils'

type PrivacyTableProps = {
    columns: readonly { id: string; label: string; className?: string }[]
    rows: readonly { id: string; cells: readonly ReactNode[] }[]
}

const CELL_CLASS_NAME = 'px-2 py-1.5 align-top [overflow-wrap:anywhere]'

export const PrivacyTable: FC<PrivacyTableProps> = ({ columns, rows }) => (
    <div className='min-w-0 border border-border'>
        <table className='w-full table-fixed border-collapse text-left text-xs leading-5'>
            <thead>
                <tr className='border-b border-border bg-muted/50'>
                    {columns.map((column) => (
                        <th key={column.id} scope='col' className={cn(CELL_CLASS_NAME, 'font-medium text-muted-foreground', column.className)}>
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id} className='border-b border-border last:border-b-0'>
                        {columns.map((column, columnIndex) =>
                            columnIndex === 0 ? (
                                <th key={column.id} scope='row' className={cn(CELL_CLASS_NAME, 'font-medium')}>
                                    {row.cells[columnIndex]}
                                </th>
                            ) : (
                                <td key={column.id} className={CELL_CLASS_NAME}>
                                    {row.cells[columnIndex]}
                                </td>
                            ),
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

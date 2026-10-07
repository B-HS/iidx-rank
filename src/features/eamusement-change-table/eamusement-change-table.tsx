import type { FC } from 'react'
import { ArrowRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { ImportChangeRow } from '@entities/eamusement/eamusement-change-rows'
import { EMPTY_VALUE_PLACEHOLDER } from '@shared/constants/eamusement-display'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@shared/ui/table'

type EamusementChangeTableProps = {
    rows: readonly ImportChangeRow[]
}

export const EamusementChangeTable: FC<EamusementChangeTableProps> = ({ rows }) => {
    const t = useTranslations()
    const locale = useLocale()

    return (
        <div className='@container min-w-0'>
            <Table className='table-fixed text-xs'>
                <TableHeader>
                    <TableRow className='hover:bg-transparent'>
                        <TableHead scope='col' className='h-auto py-2 whitespace-normal text-muted-foreground'>
                            {t('import.columnTitle')}
                            <span className='block @2xl:hidden'>{t('import.columnDifficulty')}</span>
                        </TableHead>
                        <TableHead scope='col' className='hidden h-auto w-28 py-2 text-muted-foreground @2xl:table-cell'>
                            {t('import.columnDifficulty')}
                        </TableHead>
                        <TableHead scope='col' className='h-auto w-24 py-2 text-muted-foreground @2xl:w-40'>
                            {t('import.columnLamp')}
                        </TableHead>
                        <TableHead scope='col' className='hidden h-auto w-20 py-2 text-right text-muted-foreground @2xl:table-cell'>
                            {t('import.columnScoreGrade')}
                        </TableHead>
                        <TableHead scope='col' className='h-auto w-20 py-2 text-right whitespace-normal text-muted-foreground'>
                            <span className='block @2xl:hidden'>{t('import.columnScoreGrade')}</span>
                            {t('import.columnExScore')}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const difficultyLabel = row.difficulty ? t(`difficulty.${row.difficulty}`) : EMPTY_VALUE_PLACEHOLDER
                        const previousLampLabel = row.previousLamp ? t(`lamp.${row.previousLamp}`) : t('import.lampNone')
                        const lampLabel = t(`lamp.${row.lamp}`)
                        const scoreGradeLabel = row.scoreGrade ?? EMPTY_VALUE_PLACEHOLDER

                        return (
                            <TableRow key={row.chartId} className='hover:bg-transparent'>
                                <TableCell className='break-words whitespace-normal'>
                                    <span className={row.title === null ? 'block text-muted-foreground' : 'block font-medium'}>
                                        {row.title ?? t('import.unknownChart')}
                                    </span>
                                    <span className='block text-muted-foreground @2xl:hidden'>{difficultyLabel}</span>
                                </TableCell>
                                <TableCell className='hidden text-muted-foreground @2xl:table-cell'>{difficultyLabel}</TableCell>
                                <TableCell className='whitespace-normal'>
                                    <span className='sr-only'>{t('import.lampChange', { previous: previousLampLabel, next: lampLabel })}</span>
                                    <span aria-hidden='true' className='flex min-w-0 flex-wrap items-center gap-x-1'>
                                        <span className='text-muted-foreground'>{previousLampLabel}</span>
                                        <ArrowRight className='size-3 shrink-0 text-muted-foreground' />
                                        <span className='font-medium'>{lampLabel}</span>
                                    </span>
                                </TableCell>
                                <TableCell className='hidden text-right @2xl:table-cell'>{scoreGradeLabel}</TableCell>
                                <TableCell className='text-right tabular-nums'>
                                    <span className='block @2xl:hidden'>{scoreGradeLabel}</span>
                                    {row.exScore === null ? EMPTY_VALUE_PLACEHOLDER : row.exScore.toLocaleString(locale)}
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

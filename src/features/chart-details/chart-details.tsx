'use client'
import { type FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import { type Record as ChartRecord, LAMPS, SCORE_GRADES, MAX_MEMO_LENGTH, type RecordInput } from '@entities/checker/checker.dto'
import { type Chart } from '@entities/catalog/catalog.dto'
import { CHART_MEMO_TEXTAREA_ROWS } from '@shared/constants/checker'
import { Badge } from '@shared/ui/badge'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { Label } from '@shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Textarea } from '@shared/ui/textarea'
type Props = {
    chart: Chart
    record: ChartRecord | undefined
    mode: 'normal' | 'hard'
    isAuthenticated: boolean
    isSaving: boolean
    isSaveDisabled: boolean
    onOpenChange: (isOpen: boolean) => void
    onSave: (input: RecordInput) => void
    onRequestSignIn: () => void
}
export const ChartDetails: FC<Props> = ({
    chart,
    record,
    mode,
    isAuthenticated,
    isSaving,
    isSaveDisabled,
    onOpenChange,
    onSave,
    onRequestSignIn,
}) => {
    const t = useTranslations()
    const [lamp, setLamp] = useState<ChartRecord['lamp']>(record?.lamp ?? 'NO_PLAY')
    const [scoreGrade, setScoreGrade] = useState<ChartRecord['scoreGrade']>(record?.scoreGrade ?? null)
    const [memo, setMemo] = useState(record?.memo ?? '')
    const rank = mode === 'normal' ? chart.normalRank : chart.hardRank
    const isPersonal = mode === 'normal' ? chart.normalPersonal : chart.hardPersonal
    const handleSave = () => onSave({ chartId: chart.id, lamp, memo, scoreGrade })
    return (
        <Dialog open={Boolean(chart)} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className='truncate pr-8'>{chart.title}</DialogTitle>
                    <DialogDescription>
                        {t(`difficulty.${chart.difficulty}`)} · {chart.version}
                    </DialogDescription>
                </DialogHeader>

                <div className='flex items-center gap-2 border-y border-border py-3'>
                    <Badge variant='outline'>{mode === 'normal' ? t('checker.normalMode') : t('checker.hardMode')}</Badge>
                    {rank ? (
                        <Badge variant='outline'>{t(`rank.${rank}`)}</Badge>
                    ) : (
                        <span className='text-xs text-muted-foreground'>{t('checker.noRank')}</span>
                    )}
                    {isPersonal && <Badge variant='secondary'>{t('checker.personalBadge')}</Badge>}
                </div>

                <div className='grid gap-4'>
                    <div className='grid gap-1.5'>
                        <Label htmlFor='chart-score-grade'>{t('checker.detailScoreGrade')}</Label>
                        <Select
                            value={scoreGrade ?? 'none'}
                            onValueChange={(value) => {
                                if (value === 'none') {
                                    setScoreGrade(null)
                                    return
                                }
                                const grade = SCORE_GRADES.find((item) => item === value)
                                if (grade) setScoreGrade(grade)
                            }}>
                            <SelectTrigger id='chart-score-grade' className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value='none'>{t('checker.noScoreGrade')}</SelectItem>
                                {SCORE_GRADES.map((grade) => (
                                    <SelectItem key={grade} value={grade}>
                                        {grade}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid gap-1.5'>
                        <Label htmlFor='chart-record-lamp'>{t('checker.detailLamp')}</Label>
                        <Select
                            value={lamp}
                            onValueChange={(value) => {
                                const nextLamp = LAMPS.find((item) => item === value)
                                if (nextLamp) {
                                    setLamp(nextLamp)
                                }
                            }}>
                            <SelectTrigger id='chart-record-lamp' className='w-full'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {LAMPS.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {t(`lamp.${item}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='grid gap-1.5'>
                        <Label htmlFor='chart-record-memo'>{t('checker.detailMemo')}</Label>
                        <Textarea
                            id='chart-record-memo'
                            value={memo}
                            onChange={(event) => setMemo(event.currentTarget.value)}
                            maxLength={MAX_MEMO_LENGTH}
                            placeholder={t('checker.detailMemoPlaceholder')}
                            rows={CHART_MEMO_TEXTAREA_ROWS}
                        />
                        <p className='text-xs text-muted-foreground'>{t('checker.detailMemoHint')}</p>
                    </div>
                </div>

                <DialogFooter>
                    {isAuthenticated ? (
                        <Button disabled={isSaving || isSaveDisabled} onClick={handleSave}>
                            {isSaving ? t('common.saving') : t('checker.detailSave')}
                        </Button>
                    ) : (
                        <div className='flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                            <p className='text-xs text-muted-foreground'>{t('checker.recordRequiresSignIn')}</p>
                            <Button onClick={onRequestSignIn}>{t('navigation.signIn')}</Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

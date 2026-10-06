'use client'
import { type FC } from 'react'
import { useTranslations } from 'next-intl'
import { DIFFICULTIES, RANKS } from '@entities/catalog/catalog.dto'
import { Button } from '@shared/ui/button'
import { Checkbox } from '@shared/ui/checkbox'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { Skeleton } from '@shared/ui/skeleton'
type Props = {
    search: string
    onSearchChange: (value: string) => void
    difficulty: string
    onDifficultyChange: (value: string) => void
    version: string
    versions: string[]
    onVersionChange: (value: string) => void
    rank: string
    onRankChange: (value: string) => void
    personalOnly: boolean
    onPersonalOnlyChange: (value: boolean) => void
    unplayedOnly: boolean
    onUnplayedOnlyChange: (value: boolean) => void
    isRecordsPending: boolean
    catalogCount: number
    resultCount: number
    hasActiveFilters: boolean
    onReset: () => void
}
export const CheckerFilters: FC<Props> = ({
    search,
    onSearchChange,
    difficulty,
    onDifficultyChange,
    version,
    versions,
    onVersionChange,
    rank,
    onRankChange,
    personalOnly,
    onPersonalOnlyChange,
    unplayedOnly,
    onUnplayedOnlyChange,
    isRecordsPending,
    catalogCount,
    resultCount,
    hasActiveFilters,
    onReset,
}) => {
    const t = useTranslations()
    return (
        <div className='grid gap-5'>
            <div className='grid gap-4'>
                <div className='grid gap-1.5'>
                    <Label htmlFor='checker-search' className='checker-micro-label'>
                        {t('checker.searchLabel')}
                    </Label>
                    <Input
                        id='checker-search'
                        type='search'
                        value={search}
                        onChange={(event) => onSearchChange(event.currentTarget.value)}
                        placeholder={t('checker.searchPlaceholder')}
                    />
                </div>

                <div className='grid gap-1.5'>
                    <Label className='checker-micro-label' htmlFor='checker-difficulty'>
                        {t('checker.difficultyLabel')}
                    </Label>
                    <Select value={difficulty} onValueChange={onDifficultyChange}>
                        <SelectTrigger id='checker-difficulty' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>{t('checker.allDifficulties')}</SelectItem>
                            {DIFFICULTIES.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {t(`difficulty.${item}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='grid gap-1.5'>
                    <Label className='checker-micro-label' htmlFor='checker-version'>
                        {t('checker.versionLabel')}
                    </Label>
                    <Select value={version} onValueChange={onVersionChange}>
                        <SelectTrigger id='checker-version' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>{t('checker.allVersions')}</SelectItem>
                            {versions.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {item}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='grid gap-1.5'>
                    <Label className='checker-micro-label' htmlFor='checker-rank'>
                        {t('checker.rankLabel')}
                    </Label>
                    <Select value={rank} onValueChange={onRankChange}>
                        <SelectTrigger id='checker-rank' className='w-full'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>{t('checker.allRanks')}</SelectItem>
                            <SelectItem value='none'>{t('checker.noRank')}</SelectItem>
                            {RANKS.map((item) => (
                                <SelectItem key={item} value={item}>
                                    {t(`rank.${item}`)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className='grid gap-3 border-t border-border pt-4'>
                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox checked={personalOnly} onCheckedChange={(checked) => onPersonalOnlyChange(checked === true)} />
                    <span>{t('checker.personalOnly')}</span>
                </label>
                <label className='flex cursor-pointer items-center gap-2 text-sm'>
                    <Checkbox
                        disabled={isRecordsPending}
                        checked={unplayedOnly}
                        onCheckedChange={(checked) => onUnplayedOnlyChange(checked === true)}
                    />
                    <span>{t('checker.unplayedOnly')}</span>
                </label>
            </div>

            <div className='flex min-w-0 items-center justify-between gap-3'>
                <div aria-live='polite' aria-busy={isRecordsPending && unplayedOnly} className='min-w-0 text-xs text-muted-foreground'>
                    {isRecordsPending && unplayedOnly && <Skeleton aria-label={t('checker.loadingRecords')} className='h-4 w-36 bg-sidebar-accent' />}
                    {(!isRecordsPending || !unplayedOnly) && t('checker.resultSummary', { visible: resultCount, total: catalogCount })}
                </div>
                <Button variant='outline' size='sm' disabled={!hasActiveFilters} className='shrink-0' onClick={onReset}>
                    {t('checker.resetFilters')}
                </Button>
            </div>
        </div>
    )
}

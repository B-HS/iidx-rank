'use client'

import { type FC } from 'react'

import { DIFFICULTIES, RANKS } from '@entities/catalog/catalog.dto'
import { MESSAGES } from '@shared/messages/messages'
import { Checkbox } from '@shared/ui/checkbox'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/toggle-group'

type Props = {
    mode: 'normal' | 'hard'
    onModeChange: (value: 'normal' | 'hard') => void
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
    sort: 'rank' | 'title' | 'version'
    onSortChange: (value: 'rank' | 'title' | 'version') => void
    direction: 'asc' | 'desc'
    onDirectionChange: (value: 'asc' | 'desc') => void
    catalogCount: number
    resultCount: number
}

export const CheckerFilters: FC<Props> = ({
    mode,
    onModeChange,
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
    sort,
    onSortChange,
    direction,
    onDirectionChange,
    catalogCount,
    resultCount,
}) => (
    <div className='grid gap-5'>
        <div className='grid gap-2'>
            <span className='checker-micro-label'>{MESSAGES.checker.rankLabel}</span>
            <ToggleGroup
                type='single'
                value={mode}
                onValueChange={(value) => {
                    if (value === 'normal' || value === 'hard') {
                        onModeChange(value)
                    }
                }}
                className='w-full'
                variant='outline'
                size='sm'
                spacing={0}
                aria-label={MESSAGES.checker.rankLabel}>
                <ToggleGroupItem value='normal' className='flex-1'>
                    {MESSAGES.checker.normalMode}
                </ToggleGroupItem>
                <ToggleGroupItem value='hard' className='flex-1'>
                    {MESSAGES.checker.hardMode}
                </ToggleGroupItem>
            </ToggleGroup>
        </div>

        <div className='grid gap-4'>
            <div className='grid gap-1.5'>
                <Label htmlFor='checker-search' className='checker-micro-label'>
                    {MESSAGES.checker.searchLabel}
                </Label>
                <Input
                    id='checker-search'
                    type='search'
                    value={search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                    placeholder={MESSAGES.checker.searchPlaceholder}
                />
            </div>

            <div className='grid gap-1.5'>
                <Label className='checker-micro-label' htmlFor='checker-difficulty'>
                    {MESSAGES.checker.difficultyLabel}
                </Label>
                <Select value={difficulty} onValueChange={onDifficultyChange}>
                    <SelectTrigger id='checker-difficulty' className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>{MESSAGES.checker.allDifficulties}</SelectItem>
                        {DIFFICULTIES.map((item) => (
                            <SelectItem key={item} value={item}>
                                {MESSAGES.difficulty[item]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className='grid gap-1.5'>
                <Label className='checker-micro-label' htmlFor='checker-version'>
                    {MESSAGES.checker.versionLabel}
                </Label>
                <Select value={version} onValueChange={onVersionChange}>
                    <SelectTrigger id='checker-version' className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>{MESSAGES.checker.allVersions}</SelectItem>
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
                    {MESSAGES.checker.rankLabel}
                </Label>
                <Select value={rank} onValueChange={onRankChange}>
                    <SelectTrigger id='checker-rank' className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>{MESSAGES.checker.allRanks}</SelectItem>
                        <SelectItem value='none'>{MESSAGES.checker.noRank}</SelectItem>
                        {RANKS.map((item) => (
                            <SelectItem key={item} value={item}>
                                {MESSAGES.rank[item]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className='grid gap-3 border-t border-border pt-4'>
            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                <Checkbox checked={personalOnly} onCheckedChange={(checked) => onPersonalOnlyChange(checked === true)} />
                <span>{MESSAGES.checker.personalOnly}</span>
            </label>
            <label className='flex cursor-pointer items-center gap-2 text-sm'>
                <Checkbox checked={unplayedOnly} onCheckedChange={(checked) => onUnplayedOnlyChange(checked === true)} />
                <span>{MESSAGES.checker.unplayedOnly}</span>
            </label>
        </div>

        <div className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-t border-border pt-4'>
            <div className='grid gap-1.5'>
                <Label className='checker-micro-label' htmlFor='checker-sort'>
                    {MESSAGES.checker.sortLabel}
                </Label>
                <Select
                    value={sort}
                    onValueChange={(value) => {
                        if (value === 'rank' || value === 'title' || value === 'version') {
                            onSortChange(value)
                        }
                    }}>
                    <SelectTrigger id='checker-sort' className='w-full'>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='rank'>{MESSAGES.checker.sortRank}</SelectItem>
                        <SelectItem value='title'>{MESSAGES.checker.sortTitle}</SelectItem>
                        <SelectItem value='version'>{MESSAGES.checker.sortVersion}</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Select
                value={direction}
                onValueChange={(value) => {
                    if (value === 'asc' || value === 'desc') {
                        onDirectionChange(value)
                    }
                }}>
                <SelectTrigger aria-label={MESSAGES.checker.sortDirection} className='w-28'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value='asc'>{MESSAGES.checker.sortAscending}</SelectItem>
                    <SelectItem value='desc'>{MESSAGES.checker.sortDescending}</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <p aria-live='polite' className='text-xs text-muted-foreground'>
            {MESSAGES.checker.resultSummary(resultCount, catalogCount)}
        </p>
    </div>
)

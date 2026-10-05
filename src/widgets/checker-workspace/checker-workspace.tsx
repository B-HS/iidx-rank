'use client'

import { type FC, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'

import { authClient } from '@entities/auth/auth.api'
import { type Chart, DIFFICULTIES, RANKS } from '@entities/catalog/catalog.dto'
import { useCatalog, useSyncCatalog } from '@entities/catalog/catalog.query'
import { useChecker, useRefreshChecker, useSaveRecord } from '@entities/checker/checker.query'
import { LAMPS, type RecordInput } from '@entities/checker/checker.dto'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { ChartDetails } from '@features/chart-details/chart-details'
import { CheckerFilters } from '@features/checker-filters/checker-filters'
import { ChartCardGrid } from '@features/chart-card-grid/chart-card-grid'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'
import { MESSAGES } from '@shared/messages/messages'
import { AppShell } from '@widgets/app-shell/app-shell'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { Progress } from '@shared/ui/progress'
import { SidebarTrigger } from '@shared/ui/sidebar'

type Props = {
    initialUserId: string | null
    sourceRefreshFailed: boolean
}

export const CheckerWorkspace: FC<Props> = ({ initialUserId, sourceRefreshFailed }) => {
    const queryClient = useQueryClient()
    const router = useRouter()
    const identityTransition = useIdentityTransition()
    const previousUserId = useRef(initialUserId)
    const [mode, setMode] = useState<'normal' | 'hard'>('normal')
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState('all')
    const [version, setVersion] = useState('all')
    const [rank, setRank] = useState('all')
    const [personalOnly, setPersonalOnly] = useState(false)
    const [unplayedOnly, setUnplayedOnly] = useState(false)
    const [sort, setSort] = useState<'rank' | 'title' | 'version'>('rank')
    const [direction, setDirection] = useState<'asc' | 'desc'>('asc')
    const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [hasManualCatalogSync, setHasManualCatalogSync] = useState(false)
    const { data: session, isPending: isSessionPending } = authClient.useSession()
    const { data: catalog } = useCatalog()
    const isSessionAligned = !identityTransition.isPending && (isSessionPending || (session?.user.id ?? null) === initialUserId)
    const isAuthenticated = initialUserId !== null && isSessionAligned
    const checkerQuery = useChecker(initialUserId ?? '', isAuthenticated)
    const saveRecord = useSaveRecord(initialUserId ?? '')
    const refreshChecker = useRefreshChecker(initialUserId ?? '')
    const syncCatalog = useSyncCatalog()
    const records = isAuthenticated ? (checkerQuery.data?.records ?? []) : []
    const recordsByChartId = new Map(records.map((record) => [record.chartId, record]))
    const rankFor = (chart: Chart) => (mode === 'normal' ? chart.normalRank : chart.hardRank)
    const personalFor = (chart: Chart) => (mode === 'normal' ? chart.normalPersonal : chart.hardPersonal)
    const versions = [...new Set(catalog.charts.map((chart) => chart.version))].toSorted((left, right) => left.localeCompare(right, 'ko'))
    const filteredCharts = catalog.charts
        .filter((chart) => {
            const chartRank = rankFor(chart)
            const chartRecord = recordsByChartId.get(chart.id)
            const normalizedSearch = search.trim().toLocaleLowerCase('ko-KR')

            if (normalizedSearch && !chart.title.toLocaleLowerCase('ko-KR').includes(normalizedSearch)) {
                return false
            }

            if (difficulty !== 'all' && !DIFFICULTIES.some((item) => item === difficulty && item === chart.difficulty)) {
                return false
            }

            if (version !== 'all' && chart.version !== version) {
                return false
            }

            if (rank === 'none' && chartRank !== null) {
                return false
            }

            if (rank !== 'all' && rank !== 'none' && chartRank !== rank) {
                return false
            }

            if (personalOnly && !personalFor(chart)) {
                return false
            }

            if (unplayedOnly && chartRecord && chartRecord.lamp !== 'NO_PLAY') {
                return false
            }

            return true
        })
        .toSorted((left, right) => {
            let comparison = 0

            if (sort === 'rank') {
                const leftRank = rankFor(left)
                const rightRank = rankFor(right)
                const leftRankIndex = leftRank ? RANKS.indexOf(leftRank) : RANKS.length
                const rightRankIndex = rightRank ? RANKS.indexOf(rightRank) : RANKS.length
                comparison = leftRankIndex - rightRankIndex
            }

            if (sort === 'title') {
                comparison = left.title.localeCompare(right.title, 'ko')
            }

            if (sort === 'version') {
                comparison = left.version.localeCompare(right.version, 'ko') || left.title.localeCompare(right.title, 'ko')
            }

            return direction === 'asc' ? comparison : comparison * -1
        })
    const recordedCount = records.filter((record) => record.lamp !== LAMPS[0]).length
    const completionPercent = catalog.charts.length === 0 ? 0 : Math.round((recordedCount / catalog.charts.length) * 100)
    const personalCount = catalog.charts.filter(personalFor).length
    const isSourceStale = sourceRefreshFailed && !hasManualCatalogSync
    const selectedRecord = selectedChart ? recordsByChartId.get(selectedChart.id) : undefined
    const checkerLoadFailed = isAuthenticated && checkerQuery.isError
    const formattedSourceDate = (value: string | null) => {
        if (!value) {
            return MESSAGES.checker.noTimestamp
        }

        const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00' : value

        return new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium' }).format(new Date(dateValue))
    }
    const formattedTimestamp = (value: string | null) =>
        value ? new Intl.DateTimeFormat('ko-KR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : MESSAGES.checker.noTimestamp
    const handleDifficultyChange = (value: string) => {
        if (value === 'all' || DIFFICULTIES.some((item) => item === value)) {
            setDifficulty(value)
        }
    }
    const handleRankChange = (value: string) => {
        if (value === 'all' || value === 'none' || RANKS.some((item) => item === value)) {
            setRank(value)
        }
    }
    const handleSaveRecord = (input: RecordInput) => {
        if (!isAuthenticated || checkerLoadFailed) {
            if (!isAuthenticated) {
                setIsAuthDialogOpen(true)
            }
            return
        }

        saveRecord.mutate(input, { onSuccess: () => setSelectedChart(null) })
    }
    const handleCatalogSync = async () => {
        if (!isAuthenticated) {
            setIsAuthDialogOpen(true)
            return
        }

        try {
            await syncCatalog.mutateAsync()
            setHasManualCatalogSync(true)
        } catch {
            return
        }
    }
    const renderFilters = () => (
        <CheckerFilters
            mode={mode}
            onModeChange={setMode}
            search={search}
            onSearchChange={setSearch}
            difficulty={difficulty}
            onDifficultyChange={handleDifficultyChange}
            version={version}
            versions={versions}
            onVersionChange={setVersion}
            rank={rank}
            onRankChange={handleRankChange}
            personalOnly={personalOnly}
            onPersonalOnlyChange={setPersonalOnly}
            unplayedOnly={unplayedOnly}
            onUnplayedOnlyChange={setUnplayedOnly}
            sort={sort}
            onSortChange={setSort}
            direction={direction}
            onDirectionChange={setDirection}
            catalogCount={catalog.charts.length}
            resultCount={filteredCharts.length}
        />
    )

    const sidebarContent = (
        <div className='grid min-w-0 gap-px bg-border'>
            <section className='grid min-w-0 gap-3 bg-sidebar p-0'>
                <h2 className='checker-micro-label'>{MESSAGES.checker.filtersTitle}</h2>
                {renderFilters()}
            </section>
            <section className='grid min-w-0 gap-3 bg-sidebar p-0'>
                <div className='flex min-w-0 items-center justify-between gap-2'>
                    <h2 className='checker-micro-label'>{MESSAGES.checker.sourceTitle}</h2>
                    {catalog.source.status === 'ready' && (
                        <span className='size-1.5 shrink-0 rounded-full bg-emerald-600' aria-label={MESSAGES.checker.sourceReady} />
                    )}
                </div>
                <p className='text-xs text-muted-foreground'>
                    {catalog.source.status === 'ready' ? MESSAGES.checker.sourceReady : MESSAGES.checker.sourceEmpty}
                </p>
                <dl className='grid min-w-0 gap-2 text-xs'>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{MESSAGES.checker.sourceUpdatedAt}</dt>
                        <dd className='min-w-0 break-words text-right tabular-nums'>{formattedSourceDate(catalog.source.updatedAt)}</dd>
                    </div>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{MESSAGES.checker.sourceFetchedAt}</dt>
                        <dd className='min-w-0 break-words text-right tabular-nums'>{formattedTimestamp(catalog.source.fetchedAt)}</dd>
                    </div>
                    <div className='flex min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{MESSAGES.checker.sourceCount}</dt>
                        <dd className='min-w-0 text-right tabular-nums'>{catalog.source.chartCount.toLocaleString('ko-KR')}</dd>
                    </div>
                </dl>
                <div className='grid min-w-0 grid-cols-2 gap-1'>
                    {catalog.source.url.startsWith('https://') || catalog.source.url.startsWith('http://') ? (
                        <Button variant='outline' size='sm' asChild>
                            <a href={catalog.source.url} target='_blank' rel='noopener noreferrer' className='min-w-0 truncate'>
                                {MESSAGES.checker.sourceLink}
                            </a>
                        </Button>
                    ) : (
                        <span aria-hidden='true' />
                    )}
                    <Button
                        variant='outline'
                        size='sm'
                        disabled={syncCatalog.isPending}
                        onClick={() => void handleCatalogSync()}
                        className='min-w-0 px-1 text-2xs'>
                        <span className='truncate'>{syncCatalog.isPending ? MESSAGES.checker.sourceSyncing : MESSAGES.checker.sourceSync}</span>
                    </Button>
                </div>
            </section>
            <section className='grid min-w-0 gap-3 bg-sidebar p-0'>
                <h2 className='checker-micro-label'>{MESSAGES.checker.summaryTitle}</h2>
                {isAuthenticated ? (
                    <>
                        <p className='text-xs text-muted-foreground'>{MESSAGES.checker.signedInProgress}</p>
                        <div className='flex min-w-0 items-center justify-between gap-2 text-xs'>
                            <span className='min-w-0 truncate'>{MESSAGES.checker.recordsCount(recordedCount, catalog.charts.length)}</span>
                            <span className='shrink-0 font-medium tabular-nums'>{MESSAGES.checker.completionPercent(completionPercent)}</span>
                        </div>
                        <Progress value={completionPercent} aria-label={MESSAGES.checker.completion} />
                    </>
                ) : (
                    <p className='text-xs leading-relaxed text-muted-foreground'>{MESSAGES.checker.anonymousProgress}</p>
                )}
                <div className='flex items-center justify-between gap-2 text-xs'>
                    <span className='text-muted-foreground'>{MESSAGES.checker.personalCharts}</span>
                    <span className='font-medium tabular-nums'>{personalCount.toLocaleString('ko-KR')}</span>
                </div>
            </section>
        </div>
    )

    useEffect(() => {
        const userId = session?.user.id ?? null

        if (isSessionPending) {
            return
        }

        if (previousUserId.current !== userId) {
            previousUserId.current = userId
            queryClient.clear()
            router.refresh()
        }

        if (identityTransition.isPending && userId !== identityTransition.previousUserId && userId === initialUserId) {
            identityTransition.end()
        }
    }, [identityTransition, initialUserId, isSessionPending, queryClient, router, session?.user.id])

    return (
        <AppShell sidebarContent={sidebarContent}>
            <section className='flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
                <header className='flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-0'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <SidebarTrigger aria-label={MESSAGES.navigation.openFilters} className='shrink-0 md:hidden' />
                        <div className='min-w-0'>
                            <h1 className='truncate text-sm font-semibold'>{MESSAGES.checker.title}</h1>
                            <p className='hidden truncate text-xs text-muted-foreground sm:block'>{MESSAGES.checker.description}</p>
                        </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                        <span className='hidden text-xs tabular-nums text-muted-foreground sm:inline'>
                            {MESSAGES.checker.resultCount(filteredCharts.length)}
                        </span>
                        {isAuthenticated && (
                            <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label={MESSAGES.checker.refreshRecords}
                                disabled={refreshChecker.isPending}
                                onClick={() => refreshChecker.mutate()}>
                                <RefreshCw className={refreshChecker.isPending ? 'animate-spin' : undefined} />
                            </Button>
                        )}
                    </div>
                </header>

                <div className='checker-list-scroll min-h-0 flex-1 overflow-auto p-0'>
                    {isSourceStale && (
                        <Alert className='mb-2 border-0 bg-amber-500/5'>
                            <AlertTitle>{MESSAGES.checker.sourceStaleTitle}</AlertTitle>
                            <AlertDescription>{MESSAGES.checker.sourceStale}</AlertDescription>
                        </Alert>
                    )}

                    {checkerLoadFailed && (
                        <Alert className='mb-2'>
                            <AlertTitle>{MESSAGES.checker.recordLoadErrorTitle}</AlertTitle>
                            <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
                                <span>{MESSAGES.checker.recordLoadErrorDescription}</span>
                                <Button size='sm' variant='outline' onClick={() => void checkerQuery.refetch()}>
                                    {MESSAGES.common.retry}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {catalog.charts.length === 0 ? (
                        <Empty className='checker-empty min-h-64 border-0'>
                            <EmptyHeader>
                                <EmptyTitle>{MESSAGES.checker.emptyCatalogTitle}</EmptyTitle>
                                <EmptyDescription>{MESSAGES.checker.emptyCatalogDescription}</EmptyDescription>
                            </EmptyHeader>
                            <Button size='sm' variant='outline' disabled={syncCatalog.isPending} onClick={() => void handleCatalogSync()}>
                                {syncCatalog.isPending ? MESSAGES.checker.sourceSyncing : MESSAGES.checker.sourceSync}
                            </Button>
                        </Empty>
                    ) : filteredCharts.length === 0 ? (
                        <Empty className='checker-empty min-h-64 border-0'>
                            <EmptyHeader>
                                <EmptyTitle>{MESSAGES.checker.emptyFilterTitle}</EmptyTitle>
                                <EmptyDescription>{MESSAGES.checker.emptyFilterDescription}</EmptyDescription>
                            </EmptyHeader>
                            <Button
                                size='sm'
                                variant='outline'
                                onClick={() => {
                                    setSearch('')
                                    setDifficulty('all')
                                    setVersion('all')
                                    setRank('all')
                                    setPersonalOnly(false)
                                    setUnplayedOnly(false)
                                }}>
                                {MESSAGES.checker.resetFilters}
                            </Button>
                        </Empty>
                    ) : (
                        <ChartCardGrid charts={filteredCharts} records={recordsByChartId} onOpenDetails={setSelectedChart} />
                    )}
                </div>

                {selectedChart && isSessionAligned && (
                    <ChartDetails
                        key={(initialUserId ?? 'anonymous') + ':' + selectedChart.id}
                        chart={selectedChart}
                        record={selectedRecord}
                        mode={mode}
                        isAuthenticated={isAuthenticated}
                        isSaving={saveRecord.isPending}
                        isSaveDisabled={checkerLoadFailed}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setSelectedChart(null)
                            }
                        }}
                        onSave={handleSaveRecord}
                        onRequestSignIn={() => setIsAuthDialogOpen(true)}
                    />
                )}
                <AuthDialogWidget open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
            </section>
        </AppShell>
    )
}

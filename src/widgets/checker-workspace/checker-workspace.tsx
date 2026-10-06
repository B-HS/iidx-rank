'use client'
import { type CSSProperties, type FC, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw, Settings, SlidersHorizontal } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { toast } from 'sonner'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { authClient } from '@entities/auth/auth.api'
import { type Chart, DIFFICULTIES, RANKS } from '@entities/catalog/catalog.dto'
import { useCatalog, useSyncCatalog } from '@entities/catalog/catalog.query'
import { useChecker, useRefreshChecker, useSaveRecord } from '@entities/checker/checker.query'
import { nextCheckerLamp } from '@entities/checker/checker-lamp'
import { useDisplayPreferences, useSaveDisplayPreferences } from '@entities/preferences/preferences.query'
import { LAMPS, type RecordInput } from '@entities/checker/checker.dto'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { ChartDetails } from '@features/chart-details/chart-details'
import { DisplaySettings } from '@features/display-settings/display-settings'
import { MAX_LOGO_OPACITY } from '@shared/constants/display'
import { CheckerFilters } from '@features/checker-filters/checker-filters'
import { CheckerRecordsSkeleton } from '@features/checker-skeleton/checker-records-skeleton'
import { ChartRankSection } from '@features/chart-rank-section/chart-rank-section'
import { useIdentityTransition } from '@shared/hooks/use-identity-transition'
import { useAnonymousPreferences, saveAnonymousPreferences } from '@entities/preferences/anonymous-preferences.client'
import { groupChartsByRank } from '@entities/catalog/catalog-ranks'
import { ShellSidebarPortal } from '@widgets/app-shell/shell-sidebar-portal'
import { Alert, AlertDescription, AlertTitle } from '@shared/ui/alert'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@shared/ui/dialog'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { Progress } from '@shared/ui/progress'
import { SidebarTrigger } from '@shared/ui/sidebar'
import { Skeleton } from '@shared/ui/skeleton'
type Props = {
    initialUserId: string | null
    initialIsAdmin: boolean
    initialPreferences: DisplayPreferencesInput
    initialAnonymousPreferences: DisplayPreferencesInput | null
}
export const CheckerWorkspace: FC<Props> = ({ initialUserId, initialIsAdmin, initialPreferences, initialAnonymousPreferences }) => {
    const t = useTranslations()
    const locale = useLocale()
    const anonymousPreferences = useAnonymousPreferences(initialAnonymousPreferences)
    const queryClient = useQueryClient()
    const router = useRouter()
    const identityTransition = useIdentityTransition()
    const previousUserId = useRef(initialUserId)
    const [displayDraft, setDisplayDraft] = useState<{
        userId: string | null
        preferences: DisplayPreferencesInput
    } | null>(null)
    const [mode, setMode] = useState<'normal' | 'hard'>('normal')
    const [search, setSearch] = useState('')
    const [difficulty, setDifficulty] = useState('all')
    const [version, setVersion] = useState('all')
    const [rank, setRank] = useState('all')
    const [personalOnly, setPersonalOnly] = useState(false)
    const [unplayedOnly, setUnplayedOnly] = useState(false)
    const [selectedChart, setSelectedChart] = useState<Chart | null>(null)
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const { data: session, isPending: isSessionPending } = authClient.useSession()
    const { data: catalog } = useCatalog()
    const isSessionAligned = !identityTransition.isPending && (isSessionPending || (session?.user.id ?? null) === initialUserId)
    const isAuthenticated = initialUserId !== null && isSessionAligned
    const canSyncCatalog = initialIsAdmin && isAuthenticated && !isSessionPending
    const checkerQuery = useChecker(initialUserId ?? '', isAuthenticated)
    const isRecordsPending = !isSessionAligned || (initialUserId !== null && (isSessionPending || checkerQuery.isPending))
    const saveRecord = useSaveRecord(initialUserId ?? '')
    const quickSaveRecord = useSaveRecord(initialUserId ?? '', false)
    const isRecordsSaving = saveRecord.isPending || quickSaveRecord.isPending
    const pendingRecordInput = [saveRecord, quickSaveRecord].find((mutation) => mutation.isPending)?.variables
    const pendingChartId = pendingRecordInput?.chartId ?? null
    const preferencesQuery = useDisplayPreferences(initialUserId ?? '', isAuthenticated)
    const savePreferences = useSaveDisplayPreferences(initialUserId ?? '')
    const isPreferencesPending =
        !isSessionAligned || (isAuthenticated && preferencesQuery.isPending) || (initialUserId === null && !anonymousPreferences.isReady)
    const isPreferencesLoadFailed = isAuthenticated && preferencesQuery.isError
    const storedPreferences = isAuthenticated ? (preferencesQuery.data?.preferences ?? initialPreferences) : anonymousPreferences.preferences
    const preferences = displayDraft && displayDraft.userId === initialUserId ? displayDraft.preferences : storedPreferences
    const refreshChecker = useRefreshChecker(initialUserId ?? '')
    const syncCatalog = useSyncCatalog()
    const records = isAuthenticated && !isRecordsPending ? (checkerQuery.data?.records ?? []) : []
    const recordsByChartId = new Map(records.map((record) => [record.chartId, record]))
    const rankFor = (chart: Chart) => (mode === 'normal' ? chart.normalRank : chart.hardRank)
    const personalFor = (chart: Chart) => (mode === 'normal' ? chart.normalPersonal : chart.hardPersonal)
    const versions = [...new Set(catalog.charts.map((chart) => chart.version))].toSorted((left, right) => left.localeCompare(right, locale))
    const filteredCharts = catalog.charts
        .filter((chart) => {
            const chartRank = rankFor(chart)
            const chartRecord = recordsByChartId.get(chart.id)
            const normalizedSearch = search.trim().toLocaleLowerCase(locale)
            if (normalizedSearch && !chart.title.toLocaleLowerCase(locale).includes(normalizedSearch)) {
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
        .toSorted((left, right) => left.title.localeCompare(right.title, 'ja'))
    const rankSections = groupChartsByRank(filteredCharts, mode).map((section) => ({ ...section, rank: section.rank ?? t('checker.noRank') }))
    const recordedCount = catalog.charts.filter((chart) => (recordsByChartId.get(chart.id)?.lamp ?? LAMPS[0]) !== LAMPS[0]).length
    const completionPercent = catalog.charts.length === 0 ? 0 : Math.round((recordedCount / catalog.charts.length) * 100)
    const personalCount = catalog.charts.filter(personalFor).length
    const selectedRecord = selectedChart ? recordsByChartId.get(selectedChart.id) : undefined
    const checkerLoadFailed = isAuthenticated && checkerQuery.isError
    const formattedSourceDate = (value: string | null) => {
        if (!value) {
            return t('checker.noTimestamp')
        }
        const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value + 'T00:00:00Z' : value
        return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'Asia/Tokyo' }).format(new Date(dateValue))
    }
    const formattedTimestamp = (value: string | null) =>
        value
            ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Tokyo' }).format(new Date(value))
            : t('checker.noTimestamp')
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
        if (!isAuthenticated || checkerLoadFailed || isRecordsPending || isRecordsSaving) {
            if (!isAuthenticated) {
                setIsAuthDialogOpen(true)
            }
            return
        }
        saveRecord.mutate(input, { onSuccess: () => setSelectedChart(null) })
    }
    const handleAdvanceLamp = (chart: Chart) => {
        if (isRecordsPending || isRecordsSaving || checkerLoadFailed) return
        if (!isAuthenticated) {
            setIsAuthDialogOpen(true)
            return
        }
        const currentLamp = recordsByChartId.get(chart.id)?.lamp ?? 'NO_PLAY'
        const nextLamp = nextCheckerLamp(currentLamp, mode)
        if (nextLamp === currentLamp) return
        quickSaveRecord.mutate({ chartId: chart.id, lamp: nextLamp })
    }
    const handlePreviewPreferences = (input: DisplayPreferencesInput) => setDisplayDraft({ userId: initialUserId, preferences: input })
    const handleSavePreferences = (input: DisplayPreferencesInput) => {
        if (isPreferencesPending || isPreferencesLoadFailed) return
        handlePreviewPreferences(input)
        if (!isAuthenticated) {
            if (!saveAnonymousPreferences(input)) toast.error(t('display.storageError'))
            setDisplayDraft(null)
            return
        }
        savePreferences.mutate(input, { onSuccess: () => setDisplayDraft(null), onError: () => setDisplayDraft(null) })
    }
    const handleCatalogSync = async () => {
        if (!canSyncCatalog) return
        try {
            await syncCatalog.mutateAsync()
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
            isRecordsPending={isRecordsPending}
            catalogCount={catalog.charts.length}
            resultCount={filteredCharts.length}
        />
    )
    const sidebarContent = (
        <div className='grid min-w-0 gap-px bg-border'>
            <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
                <div className='flex min-w-0 items-center justify-between gap-2'>
                    <h2 className='checker-micro-label'>{t('checker.sourceTitle')}</h2>
                    {catalog.source.status === 'ready' && (
                        <span className='size-1.5 shrink-0 rounded-full bg-emerald-600' aria-label={t('checker.sourceReady')} />
                    )}
                </div>
                <p className='h-8 text-xs text-muted-foreground'>
                    {catalog.source.status === 'ready' ? t('checker.sourceReady') : t('checker.sourceEmpty')}
                </p>
                <dl className='grid min-w-0 gap-2 text-xs'>
                    <div className='flex h-8 min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{t('checker.sourceUpdatedAt')}</dt>
                        <dd className='min-w-0 break-words text-right tabular-nums'>{formattedSourceDate(catalog.source.updatedAt)}</dd>
                    </div>
                    <div className='flex h-8 min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{t('checker.sourceFetchedAt')}</dt>
                        <dd className='min-w-0 break-words text-right tabular-nums'>{formattedTimestamp(catalog.source.fetchedAt)}</dd>
                    </div>
                    <div className='flex h-8 min-w-0 items-start justify-between gap-2'>
                        <dt className='shrink-0 text-muted-foreground'>{t('checker.sourceCount')}</dt>
                        <dd className='min-w-0 text-right tabular-nums'>{catalog.source.chartCount.toLocaleString(locale)}</dd>
                    </div>
                </dl>
                <div className='grid h-8 min-w-0 grid-cols-2 gap-1'>
                    {catalog.source.url.startsWith('https://') || catalog.source.url.startsWith('http://') ? (
                        <Button variant='outline' size='sm' asChild>
                            <a href={catalog.source.url} target='_blank' rel='noopener noreferrer' className='min-w-0 truncate'>
                                {t('checker.sourceLink')}
                            </a>
                        </Button>
                    ) : (
                        <span aria-hidden='true' />
                    )}
                    {canSyncCatalog && (
                        <Button
                            variant='outline'
                            size='sm'
                            disabled={syncCatalog.isPending}
                            onClick={() => void handleCatalogSync()}
                            className='min-w-0 px-1 text-2xs'>
                            <span className='truncate'>{syncCatalog.isPending ? t('checker.sourceSyncing') : t('checker.sourceSync')}</span>
                        </Button>
                    )}
                </div>
            </section>
            <section className='grid min-w-0 gap-3 bg-sidebar p-3'>
                <h2 className='checker-micro-label'>{t('checker.summaryTitle')}</h2>
                <div className='grid h-20 min-w-0 content-start gap-3'>
                    {isRecordsPending && <CheckerRecordsSkeleton />}
                    {!isRecordsPending && isAuthenticated && !checkerLoadFailed && (
                        <>
                            <p className='h-8 text-xs text-muted-foreground'>{t('checker.signedInProgress')}</p>
                            <div className='flex h-4 min-w-0 items-center justify-between gap-2 text-xs'>
                                <span className='min-w-0 truncate'>
                                    {t('checker.recordsCount', { recorded: recordedCount, total: catalog.charts.length })}
                                </span>
                                <span className='shrink-0 font-medium tabular-nums'>
                                    {t('checker.completionPercent', { percent: completionPercent })}
                                </span>
                            </div>
                            <Progress value={completionPercent} aria-label={t('checker.completion')} />
                        </>
                    )}
                    {!isRecordsPending && checkerLoadFailed && (
                        <p className='text-xs text-muted-foreground'>{t('checker.recordLoadErrorDescription')}</p>
                    )}
                    {!isRecordsPending && !isAuthenticated && (
                        <p className='text-xs leading-relaxed text-muted-foreground'>{t('checker.anonymousProgress')}</p>
                    )}
                </div>
                <div className='flex h-4 items-center justify-between gap-2 text-xs'>
                    <span className='text-muted-foreground'>{t('checker.personalCharts')}</span>
                    <span className='font-medium tabular-nums'>{personalCount.toLocaleString(locale)}</span>
                </div>
            </section>
        </div>
    )
    const chartDisplayStyle: CSSProperties & {
        '--checker-logo-opacity': number
    } = {
        '--checker-logo-opacity': preferences.logoOpacity / MAX_LOGO_OPACITY,
    }
    const renderChartList = () => {
        if (isPreferencesPending || (isRecordsPending && unplayedOnly)) {
            return (
                <div role='status' aria-label={t('checker.loadingRecords')} aria-busy='true' className='grid min-w-0'>
                    <span className='sr-only'>{t('checker.loadingRecords')}</span>
                    <Skeleton className='h-full min-h-[calc(100dvh-3rem)] w-full rounded-none' />
                </div>
            )
        }
        if (catalog.charts.length === 0) {
            return (
                <Empty className='checker-empty min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('checker.emptyCatalogTitle')}</EmptyTitle>
                        <EmptyDescription>{t('checker.emptyCatalogDescription')}</EmptyDescription>
                    </EmptyHeader>
                    {canSyncCatalog && (
                        <Button size='sm' variant='outline' disabled={syncCatalog.isPending} onClick={() => void handleCatalogSync()}>
                            {syncCatalog.isPending ? t('checker.sourceSyncing') : t('checker.sourceSync')}
                        </Button>
                    )}
                </Empty>
            )
        }
        if (filteredCharts.length === 0) {
            return (
                <Empty className='checker-empty min-h-64 border-0'>
                    <EmptyHeader>
                        <EmptyTitle>{t('checker.emptyFilterTitle')}</EmptyTitle>
                        <EmptyDescription>{t('checker.emptyFilterDescription')}</EmptyDescription>
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
                        {t('checker.resetFilters')}
                    </Button>
                </Empty>
            )
        }
        return (
            <div className='grid min-w-0'>
                {rankSections.map((section) => (
                    <ChartRankSection
                        mode={mode}
                        versionDisplay={preferences.versionDisplay}
                        isDisabled={isRecordsPending || isRecordsSaving || checkerLoadFailed}
                        onAdvanceLamp={handleAdvanceLamp}
                        pendingChartId={pendingChartId}
                        pendingLamp={pendingRecordInput?.lamp ?? null}
                        isRecordsPending={isRecordsPending}
                        key={section.rank}
                        {...section}
                        records={recordsByChartId}
                        onOpenDetails={setSelectedChart}
                    />
                ))}
            </div>
        )
    }
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
        <>
            <ShellSidebarPortal>{sidebarContent}</ShellSidebarPortal>
            <section style={chartDisplayStyle} className='checker-workspace'>
                <header className='checker-toolbar'>
                    <div className='flex min-w-0 items-center gap-2'>
                        <SidebarTrigger aria-label={t('navigation.openSidebar')} className='shrink-0 md:hidden' />
                        <div className='min-w-0'>
                            <h1 className='truncate text-sm font-semibold'>
                                {mode === 'normal' ? t('checker.normalMode') : t('checker.hardMode')} {t('checker.title')}
                            </h1>
                            <p className='hidden truncate text-xs text-muted-foreground sm:block'>{t('checker.description')}</p>
                        </div>
                    </div>
                    <div className='flex shrink-0 items-center gap-1'>
                        {isAuthenticated && (
                            <Button
                                variant='ghost'
                                size='icon-sm'
                                aria-label={t('checker.refreshRecords')}
                                aria-busy={refreshChecker.isPending}
                                disabled={refreshChecker.isPending || isRecordsPending}
                                onClick={() => refreshChecker.mutate()}>
                                <RefreshCw />
                            </Button>
                        )}
                        <div className='hidden h-4 w-24 text-right text-xs tabular-nums text-muted-foreground sm:block'>
                            {isRecordsPending && unplayedOnly ? (
                                <Skeleton className='h-4 w-20' />
                            ) : (
                                t('checker.resultCount', { count: filteredCharts.length })
                            )}
                        </div>
                        <Button variant='ghost' size='icon-sm' aria-label={t('navigation.openFilters')} onClick={() => setIsFiltersOpen(true)}>
                            <SlidersHorizontal />
                        </Button>
                        <Button
                            variant='ghost'
                            size='icon-sm'
                            aria-label={t('navigation.openDisplaySettings')}
                            onClick={() => setIsSettingsOpen(true)}>
                            <Settings />
                        </Button>
                    </div>
                </header>

                <div className='checker-list-scroll'>
                    {checkerLoadFailed && (
                        <Alert className='mb-2'>
                            <AlertTitle>{t('checker.recordLoadErrorTitle')}</AlertTitle>
                            <AlertDescription className='flex flex-wrap items-center justify-between gap-3'>
                                <span>{t('checker.recordLoadErrorDescription')}</span>
                                <Button size='sm' variant='outline' onClick={() => void checkerQuery.refetch()}>
                                    {t('common.retry')}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}

                    {renderChartList()}
                </div>

                {selectedChart && isSessionAligned && !isRecordsPending && (
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
                <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
                    <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>{t('checker.filtersTitle')}</DialogTitle>
                            <DialogDescription>{t('checker.filtersDescription')}</DialogDescription>
                        </DialogHeader>
                        {renderFilters()}
                    </DialogContent>
                </Dialog>
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogContent className='max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md'>
                        <DialogHeader>
                            <DialogTitle>{t('display.title')}</DialogTitle>
                            <DialogDescription>{t('display.description')}</DialogDescription>
                        </DialogHeader>
                        {isPreferencesLoadFailed ? (
                            <Alert>
                                <AlertDescription>{t('display.loadError')}</AlertDescription>
                                <Button size='sm' variant='outline' onClick={() => void preferencesQuery.refetch()}>
                                    {t('common.retry')}
                                </Button>
                            </Alert>
                        ) : (
                            <DisplaySettings
                                value={preferences}
                                isLoading={isPreferencesPending}
                                isSaving={savePreferences.isPending}
                                isAuthenticated={isAuthenticated}
                                onPreview={handlePreviewPreferences}
                                onSave={handleSavePreferences}
                            />
                        )}
                    </DialogContent>
                </Dialog>
                <AuthDialogWidget open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen} />
            </section>
        </>
    )
}

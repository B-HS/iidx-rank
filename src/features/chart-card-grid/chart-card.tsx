'use client'
import { type FC, useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Chart } from '@entities/catalog/catalog.dto'
import { getSeriesLogo } from '@entities/catalog/catalog-series'
import type { Record as ChartRecord } from '@entities/checker/checker.dto'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { CHART_LONG_PRESS_MS, CHART_PRESS_MOVE_TOLERANCE_PX, CHART_LAMP_WIDTH_PX, CHART_LAMP_BLINK_DURATION_MS } from '@shared/constants/checker'
import { MESSAGES } from '@shared/messages/messages'
import { Card, CardContent } from '@shared/ui/card'
import { Skeleton } from '@shared/ui/skeleton'

type Props = {
    chart: Chart
    record: ChartRecord | undefined
    mode: 'normal' | 'hard'
    versionDisplay: DisplayPreferencesInput['versionDisplay']
    isRecordsPending: boolean
    pendingLamp: ChartRecord['lamp'] | null
    isSaving: boolean
    isDisabled: boolean
    onAdvanceLamp: (chart: Chart) => void
    onOpenDetails: (chart: Chart) => void
}
export const ChartCard: FC<Props> = ({
    chart,
    record,
    mode,
    versionDisplay,
    isRecordsPending,
    pendingLamp,
    isSaving,
    isDisabled,
    onAdvanceLamp,
    onOpenDetails,
}) => {
    const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const pressOrigin = useRef<{ x: number; y: number } | null>(null)
    const shouldSuppressClick = useRef(false)
    const lamp = isSaving && pendingLamp ? pendingLamp : (record?.lamp ?? 'NO_PLAY')
    const logo = versionDisplay === 'logo' ? getSeriesLogo(chart.version) : null
    const visibleLamp = mode === 'hard' && !['HARD', 'EX_HARD', 'FULL_COMBO'].includes(lamp) ? 'NO_PLAY' : lamp
    const handleCancelPress = () => {
        if (pressTimer.current !== null) clearTimeout(pressTimer.current)
        pressTimer.current = null
        pressOrigin.current = null
    }
    const handleOpenDetails = () => {
        if (isDisabled) return
        handleCancelPress()
        shouldSuppressClick.current = true
        onOpenDetails(chart)
    }
    useEffect(() => {
        if (isDisabled && pressTimer.current !== null) clearTimeout(pressTimer.current)
        return () => {
            if (pressTimer.current !== null) clearTimeout(pressTimer.current)
        }
    }, [isDisabled])
    return (
        <Card
            size='sm'
            data-difficulty={chart.difficulty}
            className='checker-chart-card relative h-full min-w-0 overflow-hidden rounded-none bg-card p-0 shadow-none ring-0'>
            {logo && (
                <Image
                    src={logo}
                    alt=''
                    fill
                    sizes='(max-width: 639px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 20vw, (max-width: 1535px) 17vw, 15vw'
                    className='pointer-events-none object-contain'
                    style={{ opacity: 'var(--checker-logo-opacity)' }}
                />
            )}
            <span
                aria-hidden='true'
                data-lamp={isRecordsPending ? 'NO_PLAY' : visibleLamp}
                className='checker-lamp pointer-events-none absolute inset-y-0 left-0 z-10'
                style={{ width: CHART_LAMP_WIDTH_PX, animationDuration: CHART_LAMP_BLINK_DURATION_MS + 'ms' }}
            />
            <CardContent className='relative h-full min-w-0 p-0'>
                <button
                    type='button'
                    disabled={isDisabled}
                    aria-busy={isSaving}
                    aria-keyshortcuts='Shift+Enter'
                    title={chart.title + ' · ' + MESSAGES.difficulty[chart.difficulty] + ' · ' + chart.version + ' · ' + MESSAGES.checker.cardHint}
                    aria-label={
                        chart.title +
                        ' · ' +
                        MESSAGES.difficulty[chart.difficulty] +
                        ' · ' +
                        MESSAGES.lamp[lamp] +
                        (record?.scoreGrade ? ' · ' + record.scoreGrade : '')
                    }
                    className='relative flex h-full min-h-12 w-full min-w-0 touch-pan-y select-none flex-col justify-between gap-1 py-1.5 pr-1.5 pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring'
                    onPointerDown={(event) => {
                        if (isDisabled || event.button !== 0) return
                        handleCancelPress()
                        shouldSuppressClick.current = false
                        pressOrigin.current = { x: event.clientX, y: event.clientY }
                        pressTimer.current = setTimeout(handleOpenDetails, CHART_LONG_PRESS_MS)
                    }}
                    onPointerMove={(event) => {
                        const origin = pressOrigin.current
                        if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > CHART_PRESS_MOVE_TOLERANCE_PX) {
                            handleCancelPress()
                            shouldSuppressClick.current = true
                        }
                    }}
                    onPointerUp={handleCancelPress}
                    onPointerCancel={handleCancelPress}
                    onPointerLeave={handleCancelPress}
                    onClick={(event) => {
                        if (shouldSuppressClick.current) {
                            event.preventDefault()
                            shouldSuppressClick.current = false
                            return
                        }
                        onAdvanceLamp(chart)
                    }}
                    onContextMenu={(event) => {
                        event.preventDefault()
                        handleOpenDetails()
                    }}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && event.shiftKey) {
                            event.preventDefault()
                            onOpenDetails(chart)
                        }
                    }}>
                    <span className='line-clamp-2 min-w-0 break-words bg-card/85 text-2xs leading-tight font-medium'>{chart.title}</span>
                    <span className='flex min-w-0 items-center justify-between gap-1 text-2xs leading-tight text-muted-foreground'>
                        <span className='min-w-0 flex-1 truncate bg-card/85'>
                            {logo ? <span className='sr-only'>{chart.version}</span> : chart.version}
                        </span>
                        {(isRecordsPending || isSaving) && <Skeleton className='h-3 w-8 shrink-0' />}
                        {!isRecordsPending && !isSaving && record?.scoreGrade && (
                            <span
                                className='shrink-0 bg-card/90 px-0.5 font-semibold tabular-nums text-foreground'
                                aria-label={MESSAGES.checker.detailScoreGrade + ' ' + record.scoreGrade}>
                                {record.scoreGrade}
                            </span>
                        )}
                    </span>
                </button>
            </CardContent>
        </Card>
    )
}

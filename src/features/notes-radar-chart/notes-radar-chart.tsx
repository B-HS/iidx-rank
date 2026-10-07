import type { FC } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { NOTES_RADAR_AXES, type NotesRadar } from '@entities/eamusement/eamusement.dto'
import {
    NOTES_RADAR_CHART_DOT_RADIUS,
    NOTES_RADAR_CHART_MAX_VALUE,
    NOTES_RADAR_CHART_RADIUS,
    NOTES_RADAR_CHART_RING_COUNT,
    NOTES_RADAR_CHART_VIEW_BOX_SIZE,
} from '@shared/constants/dashboard'
import { EMPTY_VALUE_PLACEHOLDER, NOTES_RADAR_FRACTION_DIGITS } from '@shared/constants/eamusement-display'
import { cn } from '@shared/lib/utils'

type NotesRadarChartProps = {
    notesRadar: NotesRadar
    className?: string
}

const CENTER = NOTES_RADAR_CHART_VIEW_BOX_SIZE / 2
const FULL_TURN = Math.PI * 2
const QUARTER_TURN = Math.PI / 2
const AXIS_LABEL_CLASS_NAMES = {
    NOTES: 'top-0 left-1/2 -translate-x-1/2',
    CHORD: 'top-[22%] right-0 -translate-y-1/2',
    PEAK: 'top-[78%] right-0 -translate-y-1/2',
    CHARGE: 'bottom-0 left-1/2 -translate-x-1/2',
    SCRATCH: 'top-[78%] left-0 -translate-y-1/2',
    'SOF-LAN': 'top-[22%] left-0 -translate-y-1/2',
} as const satisfies Record<(typeof NOTES_RADAR_AXES)[number], string>

const getPoint = (axisIndex: number, ratio: number) => {
    const angle = (FULL_TURN * axisIndex) / NOTES_RADAR_AXES.length - QUARTER_TURN

    return { x: CENTER + NOTES_RADAR_CHART_RADIUS * ratio * Math.cos(angle), y: CENTER + NOTES_RADAR_CHART_RADIUS * ratio * Math.sin(angle) }
}

const getPolygonPoints = (ratios: readonly number[]) =>
    ratios
        .map((ratio, axisIndex) => getPoint(axisIndex, ratio))
        .map(({ x, y }) => `${x},${y}`)
        .join(' ')

const RING_POINTS = Array.from({ length: NOTES_RADAR_CHART_RING_COUNT }, (_, ringIndex) =>
    getPolygonPoints(NOTES_RADAR_AXES.map(() => (ringIndex + 1) / NOTES_RADAR_CHART_RING_COUNT)),
)
const AXIS_ENDS = NOTES_RADAR_AXES.map((axis, axisIndex) => ({ axis, ...getPoint(axisIndex, 1) }))

export const NotesRadarChart: FC<NotesRadarChartProps> = ({ notesRadar, className }) => {
    const t = useTranslations('home')
    const locale = useLocale()
    const numberFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: NOTES_RADAR_FRACTION_DIGITS,
        maximumFractionDigits: NOTES_RADAR_FRACTION_DIGITS,
    })
    const ratios = NOTES_RADAR_AXES.map((axis) => Math.min((notesRadar[axis] ?? 0) / NOTES_RADAR_CHART_MAX_VALUE, 1))
    const valueSummary = NOTES_RADAR_AXES.map((axis) => {
        const value = notesRadar[axis]

        return `${axis} ${value === null ? EMPTY_VALUE_PLACEHOLDER : numberFormat.format(value)}`
    }).join(', ')

    return (
        <div className={cn('relative', className)}>
            <svg
                role='img'
                aria-label={t('radarChartLabel', { values: valueSummary })}
                viewBox={`0 0 ${NOTES_RADAR_CHART_VIEW_BOX_SIZE} ${NOTES_RADAR_CHART_VIEW_BOX_SIZE}`}
                className='size-full'>
                {RING_POINTS.map((points, ringIndex) => (
                    <polygon
                        key={points}
                        points={points}
                        vectorEffect='non-scaling-stroke'
                        className={cn('fill-none stroke-border', ringIndex === RING_POINTS.length - 1 && 'fill-muted/50 stroke-muted-foreground/50')}
                    />
                ))}
                {AXIS_ENDS.map(({ axis, x, y }) => (
                    <line key={axis} x1={CENTER} y1={CENTER} x2={x} y2={y} vectorEffect='non-scaling-stroke' className='stroke-border' />
                ))}
                <polygon
                    points={getPolygonPoints(ratios)}
                    vectorEffect='non-scaling-stroke'
                    strokeLinejoin='round'
                    className='fill-primary/20 stroke-primary stroke-[1.5]'
                />
                {NOTES_RADAR_AXES.map((axis, axisIndex) => {
                    const { x, y } = getPoint(axisIndex, ratios[axisIndex])

                    return <circle key={axis} cx={x} cy={y} r={NOTES_RADAR_CHART_DOT_RADIUS} className='fill-primary' />
                })}
            </svg>
            {NOTES_RADAR_AXES.map((axis) => (
                <span
                    key={axis}
                    aria-hidden='true'
                    className={cn(
                        'absolute text-2xs leading-none font-medium whitespace-nowrap text-muted-foreground',
                        AXIS_LABEL_CLASS_NAMES[axis],
                    )}>
                    {axis}
                </span>
            ))}
        </div>
    )
}

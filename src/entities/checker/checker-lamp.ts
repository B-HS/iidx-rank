import type { Record as ChartRecord } from '@entities/checker/checker.dto'

const NORMAL_NEXT_LAMP = {
    NO_PLAY: 'EASY',
    FAILED: 'EASY',
    ASSIST: 'EASY',
    EASY: 'CLEAR',
    CLEAR: 'NO_PLAY',
    HARD: 'EASY',
    EX_HARD: 'EASY',
    FULL_COMBO: 'EASY',
} as const
const HARD_NEXT_LAMP = {
    NO_PLAY: 'HARD',
    FAILED: 'HARD',
    ASSIST: 'HARD',
    EASY: 'HARD',
    CLEAR: 'HARD',
    HARD: 'EX_HARD',
    EX_HARD: 'NO_PLAY',
    FULL_COMBO: 'HARD',
} as const
export const nextCheckerLamp = (lamp: ChartRecord['lamp'], mode: 'normal' | 'hard') =>
    mode === 'normal' ? NORMAL_NEXT_LAMP[lamp] : HARD_NEXT_LAMP[lamp]

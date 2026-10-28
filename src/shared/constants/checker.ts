export const CHART_MEMO_TEXTAREA_ROWS = 4

export const CHART_CARD_GRID_CLASS_NAME = 'grid min-w-0 grid-cols-5 gap-0 bg-card xl:grid-cols-6 2xl:grid-cols-7'

export const CHART_LONG_PRESS_MS = 550
export const CHART_PRESS_MOVE_TOLERANCE_PX = 10
export const CHART_LAMP_WIDTH_PX = 5
export const COARSE_POINTER_MEDIA_QUERY = '(pointer: coarse)'
export const CHECKER_TOUCH_HINT_STORAGE_KEY = 'iidx:checker-touch-hint:v1'
export const CHECKER_TOUCH_HINT_DISMISSED_VALUE = 'dismissed'
export const CHECKER_TOUCH_HINT_CHANGE_EVENT = 'iidx-checker-touch-hint-change'
export const CHART_EMPTY_CELL_LAYOUTS = [
    { columns: 5, className: 'block xl:hidden' },
    { columns: 6, className: 'hidden xl:block 2xl:hidden' },
    { columns: 7, className: 'hidden 2xl:block' },
] as const

export const CHART_MEMO_TEXTAREA_ROWS = 4

export const CHART_CARD_GRID_CLASS_NAME = 'grid min-w-0 grid-cols-3 gap-0 bg-card sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7'

export const CHART_LONG_PRESS_MS = 550
export const CHART_PRESS_MOVE_TOLERANCE_PX = 10
export const CHART_LAMP_WIDTH_PX = 5
export const CHART_LAMP_BLINK_DURATION_MS = 600
export const CHART_EMPTY_CELL_LAYOUTS = [
    { columns: 3, className: 'block sm:hidden' },
    { columns: 4, className: 'hidden sm:block lg:hidden' },
    { columns: 5, className: 'hidden lg:block xl:hidden' },
    { columns: 6, className: 'hidden xl:block 2xl:hidden' },
    { columns: 7, className: 'hidden 2xl:block' },
] as const

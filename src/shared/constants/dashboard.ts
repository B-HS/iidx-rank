export const DASHBOARD_RECENT_RECORDS_LIMIT = 20
export const DASHBOARD_BOARD_PAGE = 1
export const DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX = 'iidx:dashboard-comments-seen:v1:'
export const DASHBOARD_COMMENTS_SEEN_CHANGE_EVENT = 'iidx-dashboard-comments-seen-change'
export const DASHBOARD_COMMENTS_SEEN_MAX_IDS = 64
export const PERCENT_SCALE = 100
export const BAR_COUNT_ROW_MAX_HEIGHT_REM = 2.5
export const NOTES_RADAR_CHART_MAX_VALUE = 200
export const NOTES_RADAR_CHART_RING_COUNT = 4
export const NOTES_RADAR_CHART_VIEW_BOX_SIZE = 100
export const NOTES_RADAR_CHART_RADIUS = 34
export const NOTES_RADAR_CHART_DOT_RADIUS = 1.4

export const LAMP_STATIC_BACKGROUNDS = {
    NO_PLAY: 'var(--iidx-lamp-off)',
    FAILED: 'var(--iidx-another)',
    ASSIST: 'var(--iidx-leggendaria)',
    EASY: 'var(--iidx-easy)',
    CLEAR: 'var(--iidx-clear)',
    HARD: 'var(--iidx-hard)',
    EX_HARD: 'linear-gradient(to bottom, var(--iidx-ex-hard) 50%, var(--iidx-clear) 50%)',
    FULL_COMBO: 'linear-gradient(to bottom, var(--iidx-hard) 50%, var(--iidx-easy) 50%)',
} as const

export const DIFFICULTY_COLORS = { H: 'var(--iidx-hyper)', A: 'var(--iidx-another)', L: 'var(--iidx-leggendaria)' } as const

export const DASHBOARD_GRID_CLASS_NAME =
    'grid min-w-0 grid-cols-1 gap-px bg-border @min-[45rem]/dashboard:min-h-[44rem] @min-[45rem]/dashboard:flex-1 @min-[45rem]/dashboard:grid-cols-2 @min-[45rem]/dashboard:grid-rows-[15rem_15rem_minmax(0,1fr)] @min-[62rem]/dashboard:min-h-[31rem] @min-[62rem]/dashboard:grid-cols-3 @min-[62rem]/dashboard:grid-rows-[minmax(15rem,1fr)_minmax(0,1.6fr)] @min-[96rem]/dashboard:grid-cols-4'
export const DASHBOARD_WIDE_PANEL_CLASS_NAME = '@min-[96rem]/dashboard:col-span-2'
export const DASHBOARD_PANEL_SKELETON_CLASS_NAME = 'min-h-48 @min-[45rem]/dashboard:min-h-0'
export const DASHBOARD_RADAR_BODY_CLASS_NAME = 'h-44 @min-[45rem]/dashboard:h-auto @min-[45rem]/dashboard:min-h-0 @min-[45rem]/dashboard:flex-1'
export const DASHBOARD_GRADE_CHART_CLASS_NAME = 'h-20 @min-[45rem]/dashboard:h-auto @min-[45rem]/dashboard:min-h-0 @min-[45rem]/dashboard:flex-1'
export const DASHBOARD_SPLIT_CLASS_NAME =
    'flex min-h-0 min-w-0 flex-1 flex-col @min-[40rem]/split:flex-row @min-[40rem]/split:gap-px @min-[40rem]/split:bg-border'
export const DASHBOARD_SPLIT_SECTION_CLASS_NAMES = {
    minor: 'flex min-h-0 min-w-0 flex-col bg-card @min-[45rem]/dashboard:flex-[2]',
    major: 'flex min-h-0 min-w-0 flex-col bg-card @min-[45rem]/dashboard:flex-[3]',
} as const
export const DASHBOARD_RECENT_LIST_CLASS_NAME = 'max-h-100 @min-[45rem]/dashboard:max-h-none @min-[45rem]/dashboard:flex-1'

const LEGGENDARIA_DIFFICULTY_CODE = 'L'
const LEGGENDARIA_TITLE_PREFIX = '[L] '

export const formatChartTitle = (title: string, difficulty: string) =>
    difficulty === LEGGENDARIA_DIFFICULTY_CODE ? LEGGENDARIA_TITLE_PREFIX + title : title

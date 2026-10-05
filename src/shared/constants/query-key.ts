export const QUERY_KEY = {
    CATALOG: {
        ALL: ['catalog'] as const,
        LIST: ['catalog', 'list'] as const,
    },
    CHECKER: {
        ALL: ['checker'] as const,
        RECORDS: (userId: string) => ['checker', 'records', userId] as const,
    },
} as const

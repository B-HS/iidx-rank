export const QUERY_KEY = {
    CATALOG: {
        ALL: ['catalog'] as const,
        LIST: ['catalog', 'list'] as const,
    },
    PREFERENCES: {
        ALL: ['preferences'] as const,
        DISPLAY: (userId: string) => ['preferences', 'display', userId] as const,
    },
    CHECKER: {
        ALL: ['checker'] as const,
        RECORDS: (userId: string) => ['checker', 'records', userId] as const,
    },
    PROFILE: {
        ALL: ['profile'] as const,
        ME: ['profile', 'me'] as const,
        DETAIL: (handle: string) => ['profile', 'detail', handle] as const,
        RECORDS: (handle: string) => ['profile', 'records', handle] as const,
    },
    USERS: {
        ALL: ['users'] as const,
        LIST: (page: number) => ['users', 'list', page] as const,
    },
    BOARD: {
        ALL: ['board'] as const,
        POSTS: (params: { page: number }) => ['board', 'posts', params] as const,
        POST: (postId: string) => ['board', 'post', postId] as const,
        COMMENTS: (postId: string, page: number) => ['board', 'comments', postId, page] as const,
    },
    BLOCK: {
        ALL: ['block'] as const,
        LIST: ['block', 'list'] as const,
    },
} as const

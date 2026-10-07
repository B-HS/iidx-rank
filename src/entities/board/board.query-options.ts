import { queryOptions } from '@tanstack/react-query'
import type { CommentList, MyBoardActivity, Post, PostList } from '@entities/board/board.dto'
import { fetchBoardComments, fetchBoardPost, fetchBoardPosts, fetchMyBoardActivity } from '@entities/board/board.api'
import { QUERY_CACHE_GC_TIME_MS, USER_QUERY_STALE_TIME_MS } from '@shared/constants/cache'
import { QUERY_KEY } from '@shared/constants/query-key'

export const boardPostsQueryOptions = (page: number, queryFn: () => Promise<PostList> = () => fetchBoardPosts(page)) =>
    queryOptions({ queryKey: QUERY_KEY.BOARD.POSTS({ page }), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

export const boardPostQueryOptions = (postId: string, queryFn: () => Promise<Post> = () => fetchBoardPost(postId)) =>
    queryOptions({ queryKey: QUERY_KEY.BOARD.POST(postId), queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

export const boardCommentsQueryOptions = (
    postId: string,
    page: number,
    queryFn: () => Promise<CommentList> = () => fetchBoardComments(postId, page),
) =>
    queryOptions({
        queryKey: QUERY_KEY.BOARD.COMMENTS(postId, page),
        queryFn,
        staleTime: USER_QUERY_STALE_TIME_MS,
        gcTime: QUERY_CACHE_GC_TIME_MS,
    })

export const myBoardActivityQueryOptions = (queryFn: () => Promise<MyBoardActivity> = fetchMyBoardActivity) =>
    queryOptions({ queryKey: QUERY_KEY.BOARD.MINE, queryFn, staleTime: USER_QUERY_STALE_TIME_MS, gcTime: QUERY_CACHE_GC_TIME_MS })

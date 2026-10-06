'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { CommentCreateInput, PostCreateInput, PostUpdateInput } from '@entities/board/board.dto'
import { createBoardComment, createBoardPost, deleteBoardComment, deleteBoardPost, updateBoardPost } from '@entities/board/board.api'
import { boardCommentsQueryOptions, boardPostQueryOptions, boardPostsQueryOptions } from '@entities/board/board.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'

export const useBoardPosts = (page: number) => useQuery(boardPostsQueryOptions(page))

export const useBoardPost = (postId: string) => useQuery(boardPostQueryOptions(postId))

export const useBoardComments = (postId: string, page: number) => useQuery(boardCommentsQueryOptions(postId, page))

export const useCreatePost = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: PostCreateInput) => createBoardPost(input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL })
            toast.success(t('board.postCreateSuccess'))
        },
        onError: () => toast.error(t('board.postCreateError')),
    })
}

export const useUpdatePost = (postId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: PostUpdateInput) => updateBoardPost(postId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL })
            toast.success(t('board.postUpdateSuccess'))
        },
        onError: () => toast.error(t('board.postUpdateError')),
    })
}

export const useDeletePost = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (postId: string) => deleteBoardPost(postId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL, refetchType: 'none' })
            toast.success(t('board.postDeleteSuccess'))
        },
        onError: () => toast.error(t('board.postDeleteError')),
    })
}

export const useCreateComment = (postId: string) => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: CommentCreateInput) => createBoardComment(postId, input),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL })
            toast.success(t('board.commentCreateSuccess'))
        },
        onError: () => toast.error(t('board.commentCreateError')),
    })
}

export const useDeleteComment = () => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (commentId: string) => deleteBoardComment(commentId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEY.BOARD.ALL })
            toast.success(t('board.commentDeleteSuccess'))
        },
        onError: () => toast.error(t('board.commentDeleteError')),
    })
}

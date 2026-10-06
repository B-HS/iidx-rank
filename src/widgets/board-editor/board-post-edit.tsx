'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { useBoardPost, useUpdatePost } from '@entities/board/board.query'
import { Link, useRouter } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { BoardEditorSkeleton } from '@widgets/board-editor/board-editor-skeleton'
import { BoardPostForm } from '@widgets/board-editor/board-post-form'
import { BoardSignInPrompt } from '@widgets/board-editor/board-sign-in-prompt'

type BoardPostEditProps = {
    postId: string
    initialUserId: string | null
}

export const BoardPostEdit: FC<BoardPostEditProps> = ({ postId, initialUserId }) => {
    const t = useTranslations()
    const router = useRouter()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const postQuery = useBoardPost(postId)
    const updatePost = useUpdatePost(postId)
    const post = postQuery.data
    const postPath = `/board/${postId}`

    if (!isAligned) return <BoardEditorSkeleton />
    if (viewerId === null) return <BoardSignInPrompt />

    if (!post && postQuery.isError) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('board.postLoadErrorTitle')}</EmptyTitle>
                    <EmptyDescription>{t('board.loadErrorDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' size='sm' disabled={postQuery.isFetching} onClick={() => void postQuery.refetch()}>
                    {t('common.retry')}
                </Button>
            </Empty>
        )
    }

    if (!post) return <BoardEditorSkeleton />

    if (!post.canEdit) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('board.editForbiddenTitle')}</EmptyTitle>
                    <EmptyDescription>{t('board.editForbiddenDescription')}</EmptyDescription>
                </EmptyHeader>
                <Button variant='outline' size='sm' asChild>
                    <Link href={postPath}>{t('board.backToPost')}</Link>
                </Button>
            </Empty>
        )
    }

    return (
        <BoardPostForm
            defaultValues={{ kind: post.kind, title: post.title, content: post.content }}
            canSelectKind={false}
            isSubmitting={updatePost.isPending || updatePost.isSuccess}
            errorMessage={updatePost.error?.message}
            submitLabel={t('board.postUpdateSubmit')}
            submittingLabel={t('board.postSubmitting')}
            cancelHref={postPath}
            onSubmit={({ title, content }) => updatePost.mutate({ title, content }, { onSuccess: () => router.push(postPath) })}
        />
    )
}

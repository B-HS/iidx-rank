'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { BOARD_POST_KIND, type PostCreateInput } from '@entities/board/board.dto'
import { useCreatePost } from '@entities/board/board.query'
import { useRouter } from '@shared/i18n/navigation'
import { BoardEditorSkeleton } from '@widgets/board-editor/board-editor-skeleton'
import { BoardPostForm } from '@widgets/board-editor/board-post-form'
import { BoardSignInPrompt } from '@widgets/board-editor/board-sign-in-prompt'

type BoardPostCreateProps = {
    initialUserId: string | null
    initialIsAdmin: boolean
}

const EMPTY_POST: PostCreateInput = { kind: BOARD_POST_KIND.GENERAL, title: '', content: { type: 'doc', content: [{ type: 'paragraph' }] } }

export const BoardPostCreate: FC<BoardPostCreateProps> = ({ initialUserId, initialIsAdmin }) => {
    const t = useTranslations('board')
    const router = useRouter()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const createPost = useCreatePost()

    if (!isAligned) return <BoardEditorSkeleton />
    if (viewerId === null) return <BoardSignInPrompt />

    return (
        <BoardPostForm
            defaultValues={EMPTY_POST}
            canSelectKind={initialIsAdmin}
            isSubmitting={createPost.isPending || createPost.isSuccess}
            errorMessage={createPost.error?.message}
            submitLabel={t('postSubmit')}
            submittingLabel={t('postSubmitting')}
            cancelHref='/board'
            onSubmit={(values) => createPost.mutate(values, { onSuccess: (post) => router.push(`/board/${post.id}`) })}
        />
    )
}

import { Suspense } from 'react'
import { useTranslations } from 'next-intl'
import { getBoardViewer } from '@entities/board/board.server'
import { USER_ROLE } from '@shared/constants/user-role'
import { BoardEditorSkeleton } from '@widgets/board-editor/board-editor-skeleton'
import { BoardPostCreate } from '@widgets/board-editor/board-post-create'
import { BoardFrame } from '@widgets/board-list/board-frame'
import { BoardListLink } from '@widgets/board-list/board-list-link'

const BoardPostCreateDataBoundary = async () => {
    const viewer = await getBoardViewer()

    return <BoardPostCreate initialUserId={viewer?.userId ?? null} initialIsAdmin={viewer?.role === USER_ROLE.ADMIN} />
}

const BoardPostCreatePage = () => {
    const t = useTranslations('board')

    return (
        <BoardFrame title={t('createTitle')} actions={<BoardListLink />}>
            <Suspense fallback={<BoardEditorSkeleton />}>
                <BoardPostCreateDataBoundary />
            </Suspense>
        </BoardFrame>
    )
}

export default BoardPostCreatePage

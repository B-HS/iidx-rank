'use client'
import type { ComponentProps, FC } from 'react'
import { useBlockUser } from '@entities/block/block.query'
import { useMyProfile } from '@entities/profile/profile.query'
import { UserNameMenu } from '@features/user-name-menu/user-name-menu'

type BoardAuthorMenuProps = Pick<ComponentProps<typeof UserNameMenu>, 'author' | 'className'> & {
    viewerId: string | null
}

export const BoardAuthorMenu: FC<BoardAuthorMenuProps> = ({ author, viewerId, className }) => {
    const myProfileQuery = useMyProfile(viewerId !== null)
    const blockUser = useBlockUser()
    const myHandle = viewerId !== null && myProfileQuery.data?.userId === viewerId ? myProfileQuery.data.handle : null

    return (
        <UserNameMenu
            author={author}
            canBlock={myHandle !== null && myHandle !== author.handle}
            isBlocking={blockUser.isPending}
            className={className}
            onBlock={() => blockUser.mutate(author.handle)}
        />
    )
}

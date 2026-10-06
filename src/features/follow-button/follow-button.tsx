'use client'
import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@shared/ui/button'

type FollowButtonProps = {
    isFollowing: boolean
    isPending: boolean
    onToggle: () => void
}

export const FollowButton: FC<FollowButtonProps> = ({ isFollowing, isPending, onToggle }) => {
    const t = useTranslations('social')

    return (
        <Button variant='outline' size='sm' aria-busy={isPending} disabled={isPending} onClick={onToggle}>
            {isFollowing ? t('unfollow') : t('follow')}
        </Button>
    )
}

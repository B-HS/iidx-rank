import type { FC } from 'react'
import { Globe, Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Profile } from '@entities/profile/profile.dto'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Badge } from '@shared/ui/badge'

type DashboardIdentityProps = Pick<Profile, 'name' | 'handle' | 'avatarUrl' | 'isPublic'> & {
    counts: Pick<Profile, 'followerCount' | 'followingCount' | 'playedCount'> | null
}

export const DashboardIdentity: FC<DashboardIdentityProps> = ({ name, handle, avatarUrl, isPublic, counts }) => {
    const t = useTranslations()

    return (
        <div className='flex min-w-0 shrink-0 items-center gap-2.5'>
            <UserAvatar name={name} avatarUrl={avatarUrl} className='size-10' />
            <div className='grid min-w-0 flex-1 gap-0.5'>
                <div className='flex min-w-0 items-center gap-1.5'>
                    <p className='min-w-0 truncate text-sm leading-tight font-semibold'>{name}</p>
                    <Badge variant='outline' className='h-4 px-1.5 text-2xs'>
                        {isPublic ? <Globe aria-hidden='true' /> : <Lock aria-hidden='true' />}
                        {isPublic ? t('home.profilePublic') : t('profile.privateBadge')}
                    </Badge>
                </div>
                <p className='min-w-0 truncate text-xs text-muted-foreground'>
                    @{handle}
                    {counts && (
                        <>
                            {' · '}
                            {t('profile.followerCount', { count: counts.followerCount })}
                            {' · '}
                            {t('home.followingCount', { count: counts.followingCount })}
                        </>
                    )}
                </p>
            </div>
        </div>
    )
}

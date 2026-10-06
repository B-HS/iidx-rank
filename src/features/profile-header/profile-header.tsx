import type { FC, ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { Profile } from '@entities/profile/profile.dto'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { Badge } from '@shared/ui/badge'

type ProfileHeaderProps = {
    profile: Pick<Profile, 'handle' | 'name' | 'bio' | 'avatarUrl' | 'isPublic' | 'followerCount' | 'playedCount'>
    action: ReactNode
}

export const ProfileHeader: FC<ProfileHeaderProps> = ({ profile, action }) => {
    const t = useTranslations('profile')

    return (
        <div className='flex min-w-0 items-start gap-3 border-b border-border p-3'>
            <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} className='size-16 sm:size-20 [&_[data-slot=avatar-fallback]]:text-2xl' />
            <div className='grid min-w-0 flex-1 gap-2'>
                <div className='flex min-w-0 flex-wrap items-start justify-between gap-2'>
                    <div className='grid min-w-0 gap-1'>
                        <div className='flex min-w-0 flex-wrap items-center gap-2'>
                            <h2 className='min-w-0 text-lg leading-tight font-semibold break-words'>{profile.name}</h2>
                            {!profile.isPublic && (
                                <Badge variant='outline'>
                                    <Lock aria-hidden='true' />
                                    {t('privateBadge')}
                                </Badge>
                            )}
                        </div>
                        <p className='min-w-0 text-xs break-words text-muted-foreground'>
                            <span className='break-all'>@{profile.handle}</span>
                            {' · '}
                            {t('followerCount', { count: profile.followerCount })}
                            {' · '}
                            {t('playedCount', { count: profile.playedCount })}
                        </p>
                    </div>
                    <div className='shrink-0'>{action}</div>
                </div>
                {profile.bio && <p className='min-w-0 text-sm break-words whitespace-pre-wrap'>{profile.bio}</p>}
            </div>
        </div>
    )
}

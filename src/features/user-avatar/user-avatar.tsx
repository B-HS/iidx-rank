import type { FC } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/avatar'
type UserAvatarProps = {
    name: string
    avatarUrl: string | null
    className?: string
}
export const UserAvatar: FC<UserAvatarProps> = ({ name, avatarUrl, className }) => (
    <Avatar className={className}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt='' />}
        <AvatarFallback aria-hidden='true'>{name.trim().charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
)

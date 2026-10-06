import type { FC, PropsWithChildren } from 'react'

type ProfileSettingsSectionProps = PropsWithChildren<{
    title: string
    description: string
}>

export const ProfileSettingsSection: FC<ProfileSettingsSectionProps> = ({ title, description, children }) => (
    <section className='grid min-w-0 gap-4 border-b border-border p-3'>
        <div className='grid min-w-0 gap-1'>
            <h2 className='text-sm font-semibold'>{title}</h2>
            <p className='text-xs text-muted-foreground'>{description}</p>
        </div>
        {children}
    </section>
)

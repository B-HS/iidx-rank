import type { FC, ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { SidebarTrigger } from '@shared/ui/sidebar'
type Props = { title: string; description?: string; actions?: ReactNode }
export const ShellPageHeader: FC<Props> = ({ title, description, actions }) => {
    const t = useTranslations()
    return (
        <header className='shell-page-header'>
            <div className='flex min-w-0 items-center gap-2'>
                <SidebarTrigger aria-label={t('navigation.openSidebar')} className='shrink-0 md:hidden' />
                <div className='min-w-0'>
                    <h1 className='truncate text-sm font-semibold'>{title}</h1>
                    {description ? <p className='hidden truncate text-xs text-muted-foreground sm:block'>{description}</p> : null}
                </div>
            </div>
            {actions ? <div className='flex shrink-0 items-center gap-1'>{actions}</div> : null}
        </header>
    )
}

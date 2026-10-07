import type { ComponentProps, FC, PropsWithChildren } from 'react'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'

type DashboardPanelLinkProps = PropsWithChildren<Pick<ComponentProps<typeof Link>, 'href' | 'aria-label' | 'title'>> &
    Pick<ComponentProps<typeof Button>, 'size' | 'variant'>

export const DashboardPanelLink: FC<DashboardPanelLinkProps> = ({ size = 'xs', variant = 'ghost', children, ...linkProps }) => (
    <Button variant={variant} size={size} asChild>
        <Link {...linkProps}>{children}</Link>
    </Button>
)

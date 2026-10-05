import { createNavigation } from 'next-intl/navigation'
import { routing } from '@shared/i18n/routing'

export const { Link, useRouter, usePathname } = createNavigation(routing)

import type { ComponentProps, FC } from 'react'
import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { EXTENSION_STORE_URL } from '@shared/constants/site'

type ExtensionStoreLinkProps = Omit<ComponentProps<'a'>, 'href' | 'target' | 'rel'>

export const ExtensionStoreLink: FC<ExtensionStoreLinkProps> = ({ children, ...anchorProps }) => {
    const t = useTranslations('extension')

    return (
        <a {...anchorProps} href={EXTENSION_STORE_URL} target='_blank' rel='noopener noreferrer'>
            {children}
            <ExternalLink aria-hidden='true' />
            <span className='sr-only'>{t('newTabHint')}</span>
        </a>
    )
}

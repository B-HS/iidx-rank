import { getLocale, getTranslations } from 'next-intl/server'
import { PRIVACY_PATHNAME } from '@shared/constants/site'
import { createPageMetadata } from '@shared/lib/seo'
import { PrivacyPolicy } from '@widgets/privacy-policy/privacy-policy'

const PrivacyPage = () => <PrivacyPolicy />

export const generateMetadata = async () => {
    const [locale, t] = await Promise.all([getLocale(), getTranslations()])

    return createPageMetadata({
        locale,
        pathname: PRIVACY_PATHNAME,
        title: t('privacy.title'),
        description: t('privacy.description'),
        siteName: t('app.name'),
    })
}

export default PrivacyPage

import { getLocale, getTranslations } from 'next-intl/server'
import { HomeJsonLd } from '@features/json-ld/home-json-ld'
import { createPageMetadata } from '@shared/lib/seo'
import { HomeDashboard } from '@widgets/home-dashboard/home-dashboard'

const HomePage = () => (
    <>
        <HomeJsonLd />
        <HomeDashboard />
    </>
)

export const generateMetadata = async () => {
    const [locale, t] = await Promise.all([getLocale(), getTranslations('app')])

    return createPageMetadata({
        locale,
        pathname: '/',
        title: t('title'),
        description: t('description'),
        siteName: t('name'),
        isTitleAbsolute: true,
    })
}

export default HomePage

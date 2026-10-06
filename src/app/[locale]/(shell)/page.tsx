import { getTranslations } from 'next-intl/server'
import { HomeDashboard } from '@widgets/home-dashboard/home-dashboard'

const HomePage = () => <HomeDashboard />

export const generateMetadata = async () => {
    const t = await getTranslations('navigation')
    return { title: t('home') }
}

export default HomePage

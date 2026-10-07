import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { ProfileSettingsSection } from '@features/profile-settings-section/profile-settings-section'
import { EamusementImportLatest } from '@widgets/eamusement-import/eamusement-import-latest'
import { EamusementImportUpload } from '@widgets/eamusement-import/eamusement-import-upload'

export const EamusementImport: FC = () => {
    const t = useTranslations('settings')

    return (
        <ProfileSettingsSection title={t('eamusementSection')} description={t('eamusementSectionDescription')}>
            <p className='max-w-xl text-xs text-muted-foreground'>{t('eamusementExtensionNotice')}</p>
            <EamusementImportLatest />
            <EamusementImportUpload />
        </ProfileSettingsSection>
    )
}

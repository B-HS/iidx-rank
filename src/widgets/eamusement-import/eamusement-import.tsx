import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { ExtensionStoreLink } from '@features/extension-store-link/extension-store-link'
import { ProfileSettingsSection } from '@features/profile-settings-section/profile-settings-section'
import { Button } from '@shared/ui/button'
import { EamusementImportLatest } from '@widgets/eamusement-import/eamusement-import-latest'
import { EamusementImportUpload } from '@widgets/eamusement-import/eamusement-import-upload'

export const EamusementImport: FC = () => {
    const t = useTranslations('settings')
    const tExtension = useTranslations('extension')

    return (
        <ProfileSettingsSection title={t('eamusementSection')} description={t('eamusementSectionDescription')}>
            <section className='grid max-w-xl min-w-0 gap-2'>
                <h3 className='text-xs font-medium'>{t('eamusementExtensionTitle')}</h3>
                <p className='text-xs text-muted-foreground'>{t('eamusementExtensionNotice')}</p>
                <Button variant='outline' size='sm' className='justify-self-start' asChild>
                    <ExtensionStoreLink>{tExtension('storeInstall')}</ExtensionStoreLink>
                </Button>
                <p className='text-xs text-muted-foreground'>{tExtension('browserHint')}</p>
            </section>
            <EamusementImportLatest />
            <EamusementImportUpload />
        </ProfileSettingsSection>
    )
}

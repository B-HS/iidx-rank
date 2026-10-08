import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { PrivacyList } from '@features/privacy-document/privacy-list'
import { PrivacySection } from '@features/privacy-document/privacy-section'
import { PrivacyTable } from '@features/privacy-document/privacy-table'
import { CHECKER_TOUCH_HINT_STORAGE_KEY } from '@shared/constants/checker'
import { DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX } from '@shared/constants/dashboard'
import { ANONYMOUS_PREFERENCES_COOKIE_NAME, ANONYMOUS_PREFERENCES_STORAGE_KEY } from '@shared/constants/display'
import { CONTACT_EMAIL, EXTENSION_ISSUES_URL, PRIVACY_EFFECTIVE_DATE, SITE_ISSUES_URL } from '@shared/constants/site'
import { THEME_STORAGE_KEY } from '@shared/constants/ui'
import { ScrollContainer } from '@shared/ui/scroll-container'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'

const EFFECTIVE_DATE = new Date(PRIVACY_EFFECTIVE_DATE)
const SESSION_COOKIE_NAME = 'better-auth.session_token'
const OAUTH_STATE_COOKIE_NAME = 'better-auth.state'
const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
const SIDEBAR_COOKIE_NAME = 'sidebar_state'
const PER_ACCOUNT_KEY_SUFFIX = '*'

const SCOPE_ITEMS = ['site', 'extension'] as const
const COLLECTED_ROWS = [
    'signUp',
    'socialSignIn',
    'session',
    'profile',
    'relations',
    'records',
    'eamusementImport',
    'board',
    'upload',
    'preferences',
    'visit',
] as const
const PURPOSE_ITEMS = ['account', 'records', 'community', 'abuse', 'statistics'] as const
const VISIBILITY_ITEMS = ['board', 'publicProfile', 'listing', 'privateProfile', 'neverShown', 'files'] as const
const EXTENSION_READ_ITEMS = ['login', 'status', 'charts'] as const
const EXTENSION_STORE_ITEMS = ['dataset', 'login', 'rank', 'location'] as const
const EXTENSION_SEND_ITEMS = ['session', 'handoff', 'payload', 'exportFile'] as const
const EXTENSION_NEVER_ITEMS = ['credentials', 'otherSites', 'otherServers', 'otherPlayers'] as const
const BROWSER_STORAGE_ROWS = [
    { name: SESSION_COOKIE_NAME, kind: 'cookie', purpose: 'session' },
    { name: OAUTH_STATE_COOKIE_NAME, kind: 'cookie', purpose: 'oauthState' },
    { name: LOCALE_COOKIE_NAME, kind: 'cookie', purpose: 'locale' },
    { name: SIDEBAR_COOKIE_NAME, kind: 'cookie', purpose: 'sidebar' },
    { name: ANONYMOUS_PREFERENCES_COOKIE_NAME, kind: 'cookie', purpose: 'anonymousDisplay' },
    { name: ANONYMOUS_PREFERENCES_STORAGE_KEY, kind: 'localStorage', purpose: 'anonymousDisplay' },
    { name: THEME_STORAGE_KEY, kind: 'localStorage', purpose: 'theme' },
    { name: CHECKER_TOUCH_HINT_STORAGE_KEY, kind: 'localStorage', purpose: 'touchHint' },
    { name: DASHBOARD_COMMENTS_SEEN_STORAGE_KEY_PREFIX + PER_ACCOUNT_KEY_SUFFIX, kind: 'localStorage', purpose: 'commentsSeen' },
] as const
const PROVIDER_ROWS = [
    { key: 'vercel', name: 'Vercel' },
    { key: 'turso', name: 'Turso' },
    { key: 'r2', name: 'Cloudflare R2' },
    { key: 'socialLogin', name: 'GitHub, Naver' },
] as const
const SHARING_ITEMS = ['noSale', 'noTransfer', 'limitedUse'] as const
const RETENTION_SELF_ITEMS = ['profile', 'board', 'relations', 'records', 'extension', 'browser'] as const
const RETENTION_REQUEST_ITEMS = ['account', 'history', 'images'] as const
const CONTACT_LINKS = [
    { labelKey: 'emailLabel', href: `mailto:${CONTACT_EMAIL}`, text: CONTACT_EMAIL, isExternal: false },
    { labelKey: 'siteIssuesLabel', href: SITE_ISSUES_URL, text: SITE_ISSUES_URL, isExternal: true },
    { labelKey: 'extensionIssuesLabel', href: EXTENSION_ISSUES_URL, text: EXTENSION_ISSUES_URL, isExternal: true },
] as const

const NOTE_CLASS_NAME = 'text-xs text-muted-foreground'
const LINK_CLASS_NAME =
    'break-all underline underline-offset-4 outline-none hover:text-muted-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50'

export const PrivacyPolicy: FC = () => {
    const t = useTranslations('privacy')

    return (
        <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
            <ShellPageHeader title={t('title')} description={t('description')} />
            <ScrollContainer className='flex flex-col'>
                <article className='grid w-full max-w-3xl min-w-0 gap-8 p-3 pb-12 text-sm leading-6 break-keep'>
                    <div className='grid min-w-0 gap-2'>
                        <p className={NOTE_CLASS_NAME}>{t('effectiveDate', { date: EFFECTIVE_DATE })}</p>
                        <p>{t('intro')}</p>
                    </div>
                    <PrivacySection id='privacy-scope' title={t('scope.title')}>
                        <PrivacyList items={SCOPE_ITEMS.map((key) => ({ id: key, text: t(`scope.items.${key}`) }))} />
                    </PrivacySection>
                    <PrivacySection id='privacy-collected' title={t('collected.title')}>
                        <p>{t('collected.body')}</p>
                        <PrivacyTable
                            columns={[
                                { id: 'when', label: t('collected.columnWhen'), className: 'w-[34%]' },
                                { id: 'what', label: t('collected.columnWhat') },
                            ]}
                            rows={COLLECTED_ROWS.map((key) => ({
                                id: key,
                                cells: [t(`collected.rows.${key}.when`), t(`collected.rows.${key}.what`)],
                            }))}
                        />
                    </PrivacySection>
                    <PrivacySection id='privacy-purposes' title={t('purposes.title')}>
                        <PrivacyList items={PURPOSE_ITEMS.map((key) => ({ id: key, text: t(`purposes.items.${key}`) }))} />
                    </PrivacySection>
                    <PrivacySection id='privacy-visibility' title={t('visibility.title')}>
                        <p>{t('visibility.body')}</p>
                        <PrivacyList items={VISIBILITY_ITEMS.map((key) => ({ id: key, text: t(`visibility.items.${key}`) }))} />
                    </PrivacySection>
                    <PrivacySection id='privacy-extension' title={t('extension.title')}>
                        <p>{t('extension.body')}</p>
                        <PrivacyList
                            title={t('extension.reads.title')}
                            items={EXTENSION_READ_ITEMS.map((key) => ({ id: key, text: t(`extension.reads.items.${key}`) }))}
                        />
                        <PrivacyList
                            title={t('extension.stores.title')}
                            items={EXTENSION_STORE_ITEMS.map((key) => ({ id: key, text: t(`extension.stores.items.${key}`) }))}
                        />
                        <PrivacyList
                            title={t('extension.sends.title')}
                            items={EXTENSION_SEND_ITEMS.map((key) => ({ id: key, text: t(`extension.sends.items.${key}`) }))}
                        />
                        <PrivacyList
                            title={t('extension.never.title')}
                            items={EXTENSION_NEVER_ITEMS.map((key) => ({ id: key, text: t(`extension.never.items.${key}`) }))}
                        />
                    </PrivacySection>
                    <PrivacySection id='privacy-browser-storage' title={t('browserStorage.title')}>
                        <p>{t('browserStorage.body')}</p>
                        <PrivacyTable
                            columns={[
                                { id: 'name', label: t('browserStorage.columnName'), className: 'w-[40%]' },
                                { id: 'kind', label: t('browserStorage.columnKind'), className: 'w-[22%]' },
                                { id: 'purpose', label: t('browserStorage.columnPurpose') },
                            ]}
                            rows={BROWSER_STORAGE_ROWS.map(({ name, kind, purpose }) => ({
                                id: name,
                                cells: [
                                    <code key='name' className='font-mono'>
                                        {name}
                                    </code>,
                                    t(`browserStorage.kinds.${kind}`),
                                    t(`browserStorage.purposes.${purpose}`),
                                ],
                            }))}
                        />
                        <p className={NOTE_CLASS_NAME}>{t('browserStorage.note')}</p>
                    </PrivacySection>
                    <PrivacySection id='privacy-providers' title={t('providers.title')}>
                        <p>{t('providers.body')}</p>
                        <PrivacyTable
                            columns={[
                                { id: 'provider', label: t('providers.columnProvider'), className: 'w-[22%]' },
                                { id: 'role', label: t('providers.columnRole'), className: 'w-[28%]' },
                                { id: 'data', label: t('providers.columnData') },
                            ]}
                            rows={PROVIDER_ROWS.map(({ key, name }) => ({
                                id: key,
                                cells: [name, t(`providers.rows.${key}.role`), t(`providers.rows.${key}.data`)],
                            }))}
                        />
                    </PrivacySection>
                    <PrivacySection id='privacy-sharing' title={t('sharing.title')}>
                        <PrivacyList items={SHARING_ITEMS.map((key) => ({ id: key, text: t(`sharing.items.${key}`) }))} />
                    </PrivacySection>
                    <PrivacySection id='privacy-retention' title={t('retention.title')}>
                        <p>{t('retention.body')}</p>
                        <PrivacyList
                            title={t('retention.self.title')}
                            items={RETENTION_SELF_ITEMS.map((key) => ({ id: key, text: t(`retention.self.items.${key}`) }))}
                        />
                        <PrivacyList
                            title={t('retention.request.title')}
                            items={RETENTION_REQUEST_ITEMS.map((key) => ({ id: key, text: t(`retention.request.items.${key}`) }))}
                        />
                    </PrivacySection>
                    <PrivacySection id='privacy-contact' title={t('contact.title')}>
                        <p>{t('contact.body')}</p>
                        <dl className='grid min-w-0 gap-2'>
                            {CONTACT_LINKS.map(({ labelKey, href, text, isExternal }) => (
                                <div key={labelKey} className='grid min-w-0 gap-0.5'>
                                    <dt className='text-xs font-medium text-muted-foreground'>{t(`contact.${labelKey}`)}</dt>
                                    <dd className='min-w-0'>
                                        <a
                                            href={href}
                                            className={LINK_CLASS_NAME}
                                            target={isExternal ? '_blank' : undefined}
                                            rel={isExternal ? 'noopener noreferrer' : undefined}>
                                            {text}
                                        </a>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <p className={NOTE_CLASS_NAME}>{t('contact.note')}</p>
                    </PrivacySection>
                    <PrivacySection id='privacy-changes' title={t('changes.title')}>
                        <p>{t('changes.body')}</p>
                    </PrivacySection>
                </article>
            </ScrollContainer>
        </section>
    )
}

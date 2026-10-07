'use client'
import { type FC, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getAuthErrorKey } from '@entities/auth/auth-error'
import { authClient } from '@entities/auth/auth.api'
import type { SocialProvider } from '@shared/constants/auth'
import { Button } from '@shared/ui/button'
import { FieldError } from '@shared/ui/field'
import { Separator } from '@shared/ui/separator'

type SocialSignInButtonsProps = {
    providers: readonly SocialProvider[]
}

const PROVIDER_LABEL_KEYS = { github: 'auth.providerGithub', naver: 'auth.providerNaver' } as const satisfies Record<SocialProvider, string>

export const SocialSignInButtons: FC<SocialSignInButtonsProps> = ({ providers }) => {
    const t = useTranslations()
    const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null)
    const [errorKey, setErrorKey] = useState<ReturnType<typeof getAuthErrorKey> | 'auth.networkError' | null>(null)

    if (providers.length === 0) return null

    const handleSocialSignIn = async (provider: SocialProvider) => {
        setErrorKey(null)
        setPendingProvider(provider)

        try {
            const { pathname, search } = window.location
            const result = await authClient.signIn.social({
                provider,
                callbackURL: `${pathname}${search}`,
                errorCallbackURL: pathname,
                newUserCallbackURL: `${pathname}${search}`,
            })

            if (!result.error) return

            setErrorKey(getAuthErrorKey(result.error))
        } catch {
            setErrorKey('auth.networkError')
        }

        setPendingProvider(null)
    }

    return (
        <div className='grid gap-3'>
            <div className='grid gap-2'>
                {providers.map((provider) => (
                    <Button
                        key={provider}
                        className='w-full'
                        type='button'
                        variant='outline'
                        disabled={pendingProvider !== null}
                        onClick={() => void handleSocialSignIn(provider)}>
                        {pendingProvider === provider
                            ? t('auth.socialRedirecting')
                            : t('auth.socialContinue', { provider: t(PROVIDER_LABEL_KEYS[provider]) })}
                    </Button>
                ))}
            </div>
            <FieldError>{errorKey && t(errorKey)}</FieldError>
            <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                <Separator className='flex-1' />
                <span>{t('auth.socialDivider')}</span>
                <Separator className='flex-1' />
            </div>
        </div>
    )
}

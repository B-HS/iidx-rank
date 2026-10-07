'use client'
import { type FC, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { getSocialAuthErrorKey } from '@entities/auth/auth-error'

const AUTH_ERROR_QUERY_PARAM = 'error'
const AUTH_ERROR_DESCRIPTION_QUERY_PARAM = 'error_description'
const SOCIAL_SIGN_IN_ERROR_TOAST_ID = 'social-sign-in-error'

export const SocialSignInErrorNotice: FC = () => {
    const t = useTranslations()
    const errorCode = useSearchParams().get(AUTH_ERROR_QUERY_PARAM)

    useEffect(() => {
        if (!errorCode) return

        toast.error(t(getSocialAuthErrorKey(errorCode)), { id: SOCIAL_SIGN_IN_ERROR_TOAST_ID })

        const nextParams = new URLSearchParams(window.location.search)

        nextParams.delete(AUTH_ERROR_QUERY_PARAM)
        nextParams.delete(AUTH_ERROR_DESCRIPTION_QUERY_PARAM)

        const query = nextParams.toString()

        window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname)
    }, [errorCode, t])

    return null
}

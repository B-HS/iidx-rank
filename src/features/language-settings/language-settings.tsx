'use client'

import { type FC, useId } from 'react'
import { useTranslations } from 'next-intl'
import { LOCALE_OPTIONS } from '@shared/constants/locale'
import { Label } from '@shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@shared/ui/select'

type Props = { value: string; isPending: boolean; onChange: (value: string) => void }
export const LanguageSettings: FC<Props> = ({ value, isPending, onChange }) => {
    const t = useTranslations()
    const languageSelectId = useId()
    return (
        <div className='grid gap-1.5'>
            <Label htmlFor={languageSelectId}>{t('navigation.language')}</Label>
            <Select value={value} onValueChange={onChange} disabled={isPending}>
                <SelectTrigger id={languageSelectId} aria-label={t('navigation.language')} className='w-full'>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {LOCALE_OPTIONS.map((locale) => (
                        <SelectItem key={locale.value} value={locale.value}>
                            {locale.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

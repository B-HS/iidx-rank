'use client'
import { type FC, useId } from 'react'
import { useTranslations } from 'next-intl'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { MIN_LOGO_OPACITY, MAX_LOGO_OPACITY, LOGO_OPACITY_STEP, VERSION_DISPLAYS } from '@shared/constants/display'
import { Label } from '@shared/ui/label'
import { Skeleton } from '@shared/ui/skeleton'
import { Slider } from '@shared/ui/slider'
import { ToggleGroup, ToggleGroupItem } from '@shared/ui/toggle-group'
type Props = {
    value: DisplayPreferencesInput
    isLoading: boolean
    isSaving: boolean
    isAuthenticated: boolean
    onPreview: (input: DisplayPreferencesInput) => void
    onSave: (input: DisplayPreferencesInput) => void
}
export const DisplaySettings: FC<Props> = ({ value, isLoading, isSaving, isAuthenticated, onPreview, onSave }) => {
    const t = useTranslations()
    const logoOpacityId = useId()
    return (
        <div className='grid gap-3' aria-busy={isLoading || isSaving}>
            <div className='grid gap-1.5'>
                <Label>{t('display.versionDisplay')}</Label>
                {isLoading ? (
                    <Skeleton className='h-8 w-full' />
                ) : (
                    <ToggleGroup
                        type='single'
                        value={value.versionDisplay}
                        onValueChange={(next) => {
                            const versionDisplay = VERSION_DISPLAYS.find((item) => item === next)
                            if (versionDisplay) onSave({ ...value, versionDisplay })
                        }}
                        disabled={isLoading || isSaving}
                        className='w-full'
                        aria-label={t('display.versionDisplay')}>
                        <ToggleGroupItem value='logo' className='flex-1'>
                            {t('display.logo')}
                        </ToggleGroupItem>
                        <ToggleGroupItem value='title' className='flex-1'>
                            {t('display.seriesTitle')}
                        </ToggleGroupItem>
                    </ToggleGroup>
                )}
            </div>
            {value.versionDisplay === 'logo' && (
                <div className='grid gap-2'>
                    <div className='flex items-center justify-between gap-2'>
                        <Label htmlFor={logoOpacityId}>{t('display.logoOpacity')}</Label>
                        <span className='text-xs tabular-nums'>{value.logoOpacity}%</span>
                    </div>
                    {isLoading ? (
                        <Skeleton className='h-4 w-full' />
                    ) : (
                        <Slider
                            id={logoOpacityId}
                            className='h-4'
                            aria-label={t('display.logoOpacity')}
                            min={MIN_LOGO_OPACITY}
                            max={MAX_LOGO_OPACITY}
                            step={LOGO_OPACITY_STEP}
                            value={[value.logoOpacity]}
                            onValueChange={(values) => onPreview({ ...value, logoOpacity: values[0] ?? value.logoOpacity })}
                            onValueCommit={(values) => onSave({ ...value, logoOpacity: values[0] ?? value.logoOpacity })}
                        />
                    )}
                </div>
            )}
            <p className='h-8 text-2xs leading-relaxed text-muted-foreground'>
                {isAuthenticated ? t('display.signedInHint') : t('display.anonymousHint')}
            </p>
            {(isLoading || isSaving) && (
                <span role='status' className='sr-only'>
                    {isLoading ? t('display.loading') : t('display.saving')}
                </span>
            )}
        </div>
    )
}

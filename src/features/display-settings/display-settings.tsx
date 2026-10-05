'use client'
import type { FC } from 'react'
import type { DisplayPreferencesInput } from '@entities/preferences/preferences.dto'
import { MIN_LOGO_OPACITY, MAX_LOGO_OPACITY, LOGO_OPACITY_STEP, VERSION_DISPLAYS } from '@shared/constants/display'
import { MESSAGES } from '@shared/messages/messages'
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
    if (isLoading)
        return (
            <div role='status' aria-label={MESSAGES.display.loading} className='grid gap-3'>
                <Skeleton className='h-8 w-full bg-sidebar-accent' />
                <Skeleton className='h-4 w-full bg-sidebar-accent' />
            </div>
        )
    return (
        <div className='grid gap-3' aria-busy={isSaving}>
            <div className='grid gap-1.5'>
                <Label>{MESSAGES.display.versionDisplay}</Label>
                <ToggleGroup
                    type='single'
                    value={value.versionDisplay}
                    onValueChange={(next) => {
                        const versionDisplay = VERSION_DISPLAYS.find((item) => item === next)
                        if (versionDisplay) onSave({ ...value, versionDisplay })
                    }}
                    disabled={isSaving}
                    className='w-full'
                    aria-label={MESSAGES.display.versionDisplay}>
                    <ToggleGroupItem value='logo' className='flex-1'>
                        {MESSAGES.display.logo}
                    </ToggleGroupItem>
                    <ToggleGroupItem value='title' className='flex-1'>
                        {MESSAGES.display.seriesTitle}
                    </ToggleGroupItem>
                </ToggleGroup>
            </div>
            {value.versionDisplay === 'logo' && (
                <div className='grid gap-2'>
                    <div className='flex items-center justify-between gap-2'>
                        <Label htmlFor='logo-opacity'>{MESSAGES.display.logoOpacity}</Label>
                        <span className='text-xs tabular-nums'>{value.logoOpacity}%</span>
                    </div>
                    <Slider
                        id='logo-opacity'
                        aria-label={MESSAGES.display.logoOpacity}
                        min={MIN_LOGO_OPACITY}
                        max={MAX_LOGO_OPACITY}
                        step={LOGO_OPACITY_STEP}
                        value={[value.logoOpacity]}
                        disabled={isSaving}
                        onValueChange={(values) => onPreview({ ...value, logoOpacity: values[0] ?? value.logoOpacity })}
                        onValueCommit={(values) => onSave({ ...value, logoOpacity: values[0] ?? value.logoOpacity })}
                    />
                </div>
            )}
            <p className='text-2xs leading-relaxed text-muted-foreground'>
                {isAuthenticated ? MESSAGES.display.signedInHint : MESSAGES.display.anonymousHint}
            </p>
            {isSaving && (
                <span role='status' className='sr-only'>
                    {MESSAGES.display.saving}
                </span>
            )}
        </div>
    )
}

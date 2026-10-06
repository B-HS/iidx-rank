'use client'
import { type ChangeEvent, type FC, useId, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import type { z } from 'zod'
import { authClient } from '@entities/auth/auth.api'
import { uploadImage } from '@entities/file/file.api'
import { FILE_UPLOAD_RULES, getFileUrl } from '@entities/file/file.dto'
import {
    type MyProfile,
    PROFILE_BIO_MAX_LENGTH,
    PROFILE_NAME_MAX_LENGTH,
    PROFILE_NAME_MIN_LENGTH,
    ProfileUpdateInputSchema,
} from '@entities/profile/profile.dto'
import { HANDLE_TAKEN_ERROR_CODE, useUpdateMyProfile } from '@entities/profile/profile.query'
import { ProfileSettingsSection } from '@features/profile-settings-section/profile-settings-section'
import { UserAvatar } from '@features/user-avatar/user-avatar'
import { getApiErrorCode } from '@shared/lib/api-client'
import { useUnsavedChangesWarning } from '@shared/hooks/use-unsaved-changes-warning'
import { Button } from '@shared/ui/button'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@shared/ui/field'
import { Input } from '@shared/ui/input'
import { Switch } from '@shared/ui/switch'
import { Textarea } from '@shared/ui/textarea'

type ProfileSettingsFormProps = {
    profile: MyProfile
}

type ProfileFormValues = z.input<typeof ProfileUpdateInputSchema>

const BYTES_PER_MEGABYTE = 1024 * 1024
const AVATAR_UPLOAD_RULE = FILE_UPLOAD_RULES.avatar
const AVATAR_MAX_MEGABYTES = AVATAR_UPLOAD_RULE.maxBytes / BYTES_PER_MEGABYTE
const BIO_TEXTAREA_ROWS = 4
const HANDLE_TAKEN_ERROR_TYPE = 'taken'

const toFormValues = ({ name, handle, bio, isPublic, avatarKey }: MyProfile) => ({ name, handle, bio, isPublic, avatarKey })

export const ProfileSettingsForm: FC<ProfileSettingsFormProps> = ({ profile }) => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const t = useTranslations()
    const fieldId = useId()
    const form = useForm<ProfileFormValues>({ resolver: zodResolver(ProfileUpdateInputSchema), defaultValues: toFormValues(profile) })
    const [avatarKey, name] = useWatch({ control: form.control, name: ['avatarKey', 'name'] })
    const updateProfile = useUpdateMyProfile()
    const { refetch: refetchSession } = authClient.useSession()
    const { errors, isDirty } = form.formState
    const isBusy = isUploading || updateProfile.isPending
    const hasSaveError = updateProfile.isError && getApiErrorCode(updateProfile.error) !== HANDLE_TAKEN_ERROR_CODE
    const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (fileInputRef.current) fileInputRef.current.value = ''
        if (!file) return

        if (!AVATAR_UPLOAD_RULE.mimeTypes.some((mimeType) => mimeType === file.type)) {
            toast.error(t('settings.avatarTypeError'))
            return
        }

        if (file.size > AVATAR_UPLOAD_RULE.maxBytes) {
            toast.error(t('settings.avatarSizeError', { megabytes: AVATAR_MAX_MEGABYTES }))
            return
        }

        setIsUploading(true)

        try {
            const uploaded = await uploadImage(file, 'avatar')
            form.setValue('avatarKey', uploaded.key, { shouldDirty: true })
        } catch {
            toast.error(t('settings.avatarUploadError'))
        } finally {
            setIsUploading(false)
        }
    }
    const handleSubmit = form.handleSubmit((values) =>
        updateProfile.mutate(values, {
            onSuccess: (saved) => {
                form.reset(toFormValues(saved))
                void refetchSession()
            },
            onError: (error) => {
                if (getApiErrorCode(error) === HANDLE_TAKEN_ERROR_CODE)
                    form.setError('handle', { type: HANDLE_TAKEN_ERROR_TYPE }, { shouldFocus: true })
            },
        }),
    )

    useUnsavedChangesWarning(isDirty)

    return (
        <form noValidate onSubmit={handleSubmit} className='min-w-0' aria-busy={isBusy}>
            <ProfileSettingsSection title={t('settings.profileSection')} description={t('settings.profileSectionDescription')}>
                <FieldGroup className='max-w-xl'>
                    <Field>
                        <FieldLabel htmlFor={`${fieldId}-avatar`}>{t('settings.avatarLabel')}</FieldLabel>
                        <div className='flex min-w-0 flex-wrap items-center gap-3'>
                            <UserAvatar
                                name={name}
                                avatarUrl={avatarKey ? getFileUrl(avatarKey) : null}
                                className='size-16 [&_[data-slot=avatar-fallback]]:text-xl'
                            />
                            <div className='flex min-w-0 flex-wrap items-center gap-2'>
                                <input
                                    ref={fileInputRef}
                                    id={`${fieldId}-avatar`}
                                    type='file'
                                    accept={AVATAR_UPLOAD_RULE.mimeTypes.join(',')}
                                    className='sr-only'
                                    tabIndex={-1}
                                    disabled={isBusy}
                                    aria-describedby={`${fieldId}-avatar-hint`}
                                    onChange={(event) => void handleAvatarChange(event)}
                                />
                                <Button type='button' variant='outline' size='sm' disabled={isBusy} onClick={() => fileInputRef.current?.click()}>
                                    {isUploading ? t('settings.avatarUploading') : t('settings.avatarSelect')}
                                </Button>
                                {avatarKey && (
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        disabled={isBusy}
                                        onClick={() => form.setValue('avatarKey', null, { shouldDirty: true })}>
                                        {t('settings.avatarRemove')}
                                    </Button>
                                )}
                            </div>
                        </div>
                        <FieldDescription id={`${fieldId}-avatar-hint`} className='text-xs'>
                            {t('settings.avatarHint', { megabytes: AVATAR_MAX_MEGABYTES })}
                        </FieldDescription>
                    </Field>
                    <Field data-invalid={Boolean(errors.name)}>
                        <FieldLabel htmlFor={`${fieldId}-name`}>{t('settings.nameLabel')}</FieldLabel>
                        <Input
                            id={`${fieldId}-name`}
                            autoComplete='nickname'
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
                            {...form.register('name')}
                        />
                        <FieldError id={`${fieldId}-name-error`}>
                            {errors.name && t('settings.nameError', { min: PROFILE_NAME_MIN_LENGTH, max: PROFILE_NAME_MAX_LENGTH })}
                        </FieldError>
                    </Field>
                    <Field data-invalid={Boolean(errors.handle)}>
                        <FieldLabel htmlFor={`${fieldId}-handle`}>{t('settings.handleLabel')}</FieldLabel>
                        <Input
                            id={`${fieldId}-handle`}
                            autoComplete='username'
                            autoCapitalize='none'
                            autoCorrect='off'
                            spellCheck={false}
                            aria-invalid={Boolean(errors.handle)}
                            aria-describedby={`${fieldId}-handle-hint${errors.handle ? ` ${fieldId}-handle-error` : ''}`}
                            {...form.register('handle')}
                        />
                        <FieldDescription id={`${fieldId}-handle-hint`} className='text-xs'>
                            {t('settings.handleHint')}
                        </FieldDescription>
                        <FieldError id={`${fieldId}-handle-error`}>
                            {errors.handle && t(errors.handle.type === HANDLE_TAKEN_ERROR_TYPE ? 'settings.handleTaken' : 'settings.handleError')}
                        </FieldError>
                    </Field>
                    <Field data-invalid={Boolean(errors.bio)}>
                        <FieldLabel htmlFor={`${fieldId}-bio`}>{t('settings.bioLabel')}</FieldLabel>
                        <Textarea
                            id={`${fieldId}-bio`}
                            rows={BIO_TEXTAREA_ROWS}
                            aria-invalid={Boolean(errors.bio)}
                            aria-describedby={`${fieldId}-bio-hint${errors.bio ? ` ${fieldId}-bio-error` : ''}`}
                            {...form.register('bio')}
                        />
                        <FieldDescription id={`${fieldId}-bio-hint`} className='text-xs'>
                            {t('settings.bioHint', { max: PROFILE_BIO_MAX_LENGTH })}
                        </FieldDescription>
                        <FieldError id={`${fieldId}-bio-error`}>{errors.bio && t('settings.bioError', { max: PROFILE_BIO_MAX_LENGTH })}</FieldError>
                    </Field>
                </FieldGroup>
            </ProfileSettingsSection>
            <ProfileSettingsSection title={t('settings.visibilitySection')} description={t('settings.visibilitySectionDescription')}>
                <Field orientation='horizontal' className='max-w-xl'>
                    <FieldContent>
                        <FieldLabel htmlFor={`${fieldId}-public`}>{t('settings.publicLabel')}</FieldLabel>
                        <FieldDescription id={`${fieldId}-public-hint`} className='text-xs'>
                            {t('settings.publicDescription')}
                        </FieldDescription>
                    </FieldContent>
                    <Controller
                        control={form.control}
                        name='isPublic'
                        render={({ field }) => (
                            <Switch
                                id={`${fieldId}-public`}
                                ref={field.ref}
                                checked={field.value}
                                disabled={isBusy}
                                aria-describedby={`${fieldId}-public-hint`}
                                onBlur={field.onBlur}
                                onCheckedChange={field.onChange}
                            />
                        )}
                    />
                </Field>
            </ProfileSettingsSection>
            <div className='grid min-w-0 border-b border-border p-3'>
                <div className='grid max-w-xl min-w-0 gap-3'>
                    <FieldError>{hasSaveError && t('settings.saveError')}</FieldError>
                    <div className='flex justify-end'>
                        <Button type='submit' size='sm' disabled={isBusy || !isDirty}>
                            {updateProfile.isPending ? t('common.saving') : t('common.save')}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    )
}

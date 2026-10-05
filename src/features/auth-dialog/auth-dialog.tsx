'use client'
import { type FC, type ReactNode, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
import { getAuthErrorKey } from '@entities/auth/auth-error'
import { authClient } from '@entities/auth/auth.api'
import { AUTH_PASSWORD_MIN_LENGTH, AUTH_PASSWORD_MAX_LENGTH } from '@shared/constants/auth'
import { Button } from '@shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@shared/ui/dialog'
import { FieldError } from '@shared/ui/field'
import { Input } from '@shared/ui/input'
import { Label } from '@shared/ui/label'
type AuthFormProps = {
    onSuccess: () => void
    onSwitch: () => void
}
const SignInForm: FC<AuthFormProps> = ({ onSuccess, onSwitch }) => {
    const t = useTranslations()
    const SignInSchema = z.object({
        email: z.email({ error: t('auth.emailInvalid') }),
        password: z.string().min(AUTH_PASSWORD_MIN_LENGTH, t('auth.passwordTooShort')).max(AUTH_PASSWORD_MAX_LENGTH, t('auth.passwordTooLong')),
    })
    const form = useForm<z.input<typeof SignInSchema>>({
        resolver: zodResolver(SignInSchema),
        defaultValues: { email: '', password: '' },
    })
    const handleSubmit = form.handleSubmit(async (values) => {
        form.clearErrors('root.server')
        try {
            const result = await authClient.signIn.email(values)
            if (result.error) {
                form.setError('root.server', { message: t(getAuthErrorKey(result.error)) })
                return
            }
            toast.success(t('auth.signInSuccess'))
            onSuccess()
        } catch {
            form.setError('root.server', { message: t('auth.networkError') })
        }
    })
    return (
        <form className='grid gap-4' noValidate onSubmit={handleSubmit}>
            <div className='grid gap-1.5'>
                <Label htmlFor='sign-in-email'>{t('auth.emailLabel')}</Label>
                <Input
                    id='sign-in-email'
                    autoComplete='email'
                    type='email'
                    aria-invalid={Boolean(form.formState.errors.email)}
                    aria-describedby={form.formState.errors.email ? 'sign-in-email-error' : undefined}
                    {...form.register('email')}
                />
                <FieldError id='sign-in-email-error'>{form.formState.errors.email?.message}</FieldError>
            </div>
            <div className='grid gap-1.5'>
                <Label htmlFor='sign-in-password'>{t('auth.passwordLabel')}</Label>
                <Input
                    id='sign-in-password'
                    autoComplete='current-password'
                    type='password'
                    aria-invalid={Boolean(form.formState.errors.password)}
                    aria-describedby={form.formState.errors.password ? 'sign-in-password-error' : undefined}
                    {...form.register('password')}
                />
                <FieldError id='sign-in-password-error'>{form.formState.errors.password?.message}</FieldError>
            </div>
            <FieldError>{form.formState.errors.root?.server?.message}</FieldError>
            <Button className='w-full' type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('auth.signingIn') : t('auth.submitSignIn')}
            </Button>
            <Button className='w-full' type='button' variant='ghost' onClick={onSwitch}>
                {t('auth.switchToSignUp')}
            </Button>
        </form>
    )
}
const SignUpForm: FC<AuthFormProps> = ({ onSuccess, onSwitch }) => {
    const t = useTranslations()
    const SignUpSchema = z.object({
        name: z.string().trim().min(1, t('auth.nameRequired')),
        email: z.email({ error: t('auth.emailInvalid') }),
        password: z.string().min(AUTH_PASSWORD_MIN_LENGTH, t('auth.passwordTooShort')).max(AUTH_PASSWORD_MAX_LENGTH, t('auth.passwordTooLong')),
    })
    const form = useForm<z.input<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: { name: '', email: '', password: '' },
    })
    const handleSubmit = form.handleSubmit(async (values) => {
        form.clearErrors('root.server')
        try {
            const result = await authClient.signUp.email(values)
            if (result.error) {
                form.setError('root.server', { message: t(getAuthErrorKey(result.error)) })
                return
            }
            toast.success(t('auth.signUpSuccess'))
            onSuccess()
        } catch {
            form.setError('root.server', { message: t('auth.networkError') })
        }
    })
    return (
        <form className='grid gap-4' noValidate onSubmit={handleSubmit}>
            <div className='grid gap-1.5'>
                <Label htmlFor='sign-up-name'>{t('auth.nameLabel')}</Label>
                <Input
                    id='sign-up-name'
                    autoComplete='name'
                    aria-invalid={Boolean(form.formState.errors.name)}
                    aria-describedby={form.formState.errors.name ? 'sign-up-name-error' : undefined}
                    {...form.register('name')}
                />
                <FieldError id='sign-up-name-error'>{form.formState.errors.name?.message}</FieldError>
            </div>
            <div className='grid gap-1.5'>
                <Label htmlFor='sign-up-email'>{t('auth.emailLabel')}</Label>
                <Input
                    id='sign-up-email'
                    autoComplete='email'
                    type='email'
                    aria-invalid={Boolean(form.formState.errors.email)}
                    aria-describedby={form.formState.errors.email ? 'sign-up-email-error' : undefined}
                    {...form.register('email')}
                />
                <FieldError id='sign-up-email-error'>{form.formState.errors.email?.message}</FieldError>
            </div>
            <div className='grid gap-1.5'>
                <Label htmlFor='sign-up-password'>{t('auth.passwordLabel')}</Label>
                <Input
                    id='sign-up-password'
                    autoComplete='new-password'
                    type='password'
                    aria-invalid={Boolean(form.formState.errors.password)}
                    aria-describedby={form.formState.errors.password ? 'sign-up-password-error' : undefined}
                    {...form.register('password')}
                />
                <FieldError id='sign-up-password-error'>{form.formState.errors.password?.message}</FieldError>
            </div>
            <FieldError>{form.formState.errors.root?.server?.message}</FieldError>
            <Button className='w-full' type='submit' disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? t('auth.signingUp') : t('auth.submitSignUp')}
            </Button>
            <Button className='w-full' type='button' variant='ghost' onClick={onSwitch}>
                {t('auth.switchToSignIn')}
            </Button>
        </form>
    )
}
type Props = {
    children?: ReactNode
    open?: boolean
    onOpenChange?: (isOpen: boolean) => void
}
export const AuthDialogWidget: FC<Props> = ({ children, open, onOpenChange }) => {
    const t = useTranslations()
    const [internalOpen, setInternalOpen] = useState(false)
    const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
    const isOpen = open ?? internalOpen
    const handleOpenChange = onOpenChange ?? setInternalOpen
    const isSigningUp = mode === 'sign-up'
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {children && <DialogTrigger asChild>{children}</DialogTrigger>}
            <DialogContent className='max-w-md'>
                <DialogHeader>
                    <DialogTitle>{isSigningUp ? t('auth.signUpTitle') : t('auth.signInTitle')}</DialogTitle>
                    <DialogDescription>{isSigningUp ? t('auth.signUpDescription') : t('auth.signInDescription')}</DialogDescription>
                </DialogHeader>
                {isSigningUp ? (
                    <SignUpForm onSuccess={() => handleOpenChange(false)} onSwitch={() => setMode('sign-in')} />
                ) : (
                    <SignInForm onSuccess={() => handleOpenChange(false)} onSwitch={() => setMode('sign-up')} />
                )}
            </DialogContent>
        </Dialog>
    )
}

'use client'
import { type FC, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useViewerIdentity } from '@entities/auth/use-viewer-identity'
import { sendHandoffResult } from '@entities/eamusement/eamusement-handoff'
import { EXTENSION_IMPORT_CHANNEL, type ImportInput } from '@entities/eamusement/eamusement.dto'
import { useImportRecords } from '@entities/eamusement/eamusement.query'
import { AuthDialogWidget } from '@features/auth-dialog/auth-dialog'
import { EamusementHandoffFailure } from '@features/eamusement-handoff-failure/eamusement-handoff-failure'
import { EamusementHandoffProgress } from '@features/eamusement-handoff-progress/eamusement-handoff-progress'
import { getApiErrorCode } from '@shared/lib/api-client'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { EamusementHandoffResult } from '@widgets/eamusement-handoff/eamusement-handoff-result'

type EamusementHandoffUploadProps = {
    handoffId: string
    input: ImportInput
    initialUserId: string | null
}

type UploadImport = ReturnType<typeof useImportRecords>['mutateAsync']

const uploadHandoff = async (uploadImport: UploadImport, handoffId: string, input: ImportInput) => {
    try {
        const result = await uploadImport(input)

        sendHandoffResult(window, handoffId, { status: 'success', result })
    } catch (error) {
        sendHandoffResult(window, handoffId, { status: 'failed', code: getApiErrorCode(error) })
    }
}

export const EamusementHandoffUpload: FC<EamusementHandoffUploadProps> = ({ handoffId, input, initialUserId }) => {
    const hasStartedRef = useRef(false)
    const t = useTranslations()
    const { isAligned, viewerId } = useViewerIdentity(initialUserId)
    const importRecords = useImportRecords({ channelHint: EXTENSION_IMPORT_CHANNEL, isSuccessToastEnabled: false })
    const { mutateAsync: uploadImport } = importRecords
    const isSignedIn = isAligned && viewerId !== null

    useEffect(() => {
        if (!isSignedIn || hasStartedRef.current) return

        hasStartedRef.current = true
        void uploadHandoff(uploadImport, handoffId, input)
    }, [isSignedIn, uploadImport, handoffId, input])

    if (importRecords.isSuccess) return <EamusementHandoffResult result={importRecords.data} />

    if (isAligned && viewerId === null) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('import.signInTitle')}</EmptyTitle>
                    <EmptyDescription>{t('import.signInDescription')}</EmptyDescription>
                </EmptyHeader>
                <AuthDialogWidget>
                    <Button variant='outline' size='sm'>
                        {t('navigation.signIn')}
                    </Button>
                </AuthDialogWidget>
            </Empty>
        )
    }

    if (importRecords.isError) {
        return (
            <EamusementHandoffFailure code={getApiErrorCode(importRecords.error)}>
                <Button variant='outline' size='sm' onClick={() => void uploadHandoff(uploadImport, handoffId, input)}>
                    {t('common.retry')}
                </Button>
            </EamusementHandoffFailure>
        )
    }

    return <EamusementHandoffProgress title={t('import.uploadingTitle')} description={t('import.uploadingDescription')} />
}

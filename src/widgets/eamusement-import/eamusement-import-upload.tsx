'use client'
import { type ChangeEvent, type FC, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getImportErrorKey, getImportFileErrorKey } from '@entities/eamusement/eamusement-error'
import { parseImportFile } from '@entities/eamusement/eamusement-file'
import type { ImportInput } from '@entities/eamusement/eamusement.dto'
import { useImportRecords } from '@entities/eamusement/eamusement.query'
import { EamusementImportCounts } from '@features/eamusement-import-counts/eamusement-import-counts'
import { EamusementUnmatchedList } from '@features/eamusement-unmatched-list/eamusement-unmatched-list'
import { IMPORT_COOLDOWN_MS, IMPORT_MAX_BODY_BYTES } from '@shared/constants/eamusement'
import { BYTES_PER_MEGABYTE, MS_PER_SECOND } from '@shared/constants/eamusement-display'
import { getApiErrorCode } from '@shared/lib/api-client'
import { Button } from '@shared/ui/button'
import { FieldError } from '@shared/ui/field'

const IMPORT_FILE_ACCEPT = 'application/json,.json'
const MESSAGE_VALUES = { megabytes: IMPORT_MAX_BODY_BYTES / BYTES_PER_MEGABYTE, seconds: IMPORT_COOLDOWN_MS / MS_PER_SECOND }

export const EamusementImportUpload: FC = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [pendingInput, setPendingInput] = useState<ImportInput | null>(null)
    const [fileErrorKey, setFileErrorKey] = useState<ReturnType<typeof getImportFileErrorKey> | null>(null)
    const t = useTranslations()
    const fieldId = useId()
    const importRecords = useImportRecords()
    const importErrorKey = importRecords.isError ? getImportErrorKey(getApiErrorCode(importRecords.error)) : null
    const errorKey = fileErrorKey ?? importErrorKey
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]

        if (fileInputRef.current) fileInputRef.current.value = ''
        if (!file) return

        importRecords.reset()
        setFileName(file.name)

        const parsed = await parseImportFile(file)

        if (parsed.status !== 'VALID') {
            setPendingInput(null)
            setFileErrorKey(getImportFileErrorKey(parsed.status))
            return
        }

        setFileErrorKey(null)
        setPendingInput(parsed.input)
    }
    const handleImport = () => {
        if (!pendingInput) return

        importRecords.mutate(pendingInput, {
            onSuccess: () => {
                setPendingInput(null)
                setFileName(null)
            },
        })
    }

    return (
        <div className='grid max-w-xl min-w-0 gap-3' aria-busy={importRecords.isPending}>
            <h3 className='text-xs font-medium'>{t('settings.eamusementUploadTitle')}</h3>
            <p id={`${fieldId}-hint`} className='text-xs text-muted-foreground'>
                {t('settings.eamusementUploadDescription', MESSAGE_VALUES)}
            </p>
            <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <input
                    ref={fileInputRef}
                    type='file'
                    accept={IMPORT_FILE_ACCEPT}
                    className='sr-only'
                    tabIndex={-1}
                    disabled={importRecords.isPending}
                    aria-label={t('settings.eamusementFileLabel')}
                    aria-describedby={`${fieldId}-hint`}
                    onChange={(event) => void handleFileChange(event)}
                />
                <Button type='button' variant='outline' size='sm' disabled={importRecords.isPending} onClick={() => fileInputRef.current?.click()}>
                    {t('settings.eamusementFileSelect')}
                </Button>
                <span className='min-w-0 flex-1 truncate text-xs text-muted-foreground'>{fileName ?? t('settings.eamusementFileNone')}</span>
                <Button type='button' size='sm' disabled={!pendingInput || importRecords.isPending} onClick={handleImport}>
                    {importRecords.isPending ? t('settings.eamusementImporting') : t('settings.eamusementImportSubmit')}
                </Button>
            </div>
            <FieldError>{errorKey && t(errorKey, MESSAGE_VALUES)}</FieldError>
            {importRecords.data && (
                <section className='grid min-w-0 gap-3 border border-border p-3'>
                    <h4 className='text-xs font-medium'>{t('settings.eamusementResultTitle')}</h4>
                    <EamusementImportCounts
                        receivedCount={importRecords.data.receivedCount}
                        matchedCount={importRecords.data.matchedCount}
                        changedCount={importRecords.data.changedCount}
                    />
                    <EamusementUnmatchedList unmatched={importRecords.data.unmatched} />
                </section>
            )}
        </div>
    )
}

'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { postImportRecords } from '@entities/eamusement/eamusement.api'
import type { ImportChannel, ImportInput } from '@entities/eamusement/eamusement.dto'
import { importStatusQueryOptions } from '@entities/eamusement/eamusement.query-options'
import { QUERY_KEY } from '@shared/constants/query-key'

const IMPORT_SCOPE_ID = 'eamusement-import'

type ImportRecordsOptions = {
    channelHint?: ImportChannel
    isSuccessToastEnabled?: boolean
}

export const useImportStatus = (enabled: boolean) => useQuery({ ...importStatusQueryOptions(), enabled })

export const useImportRecords = ({ channelHint, isSuccessToastEnabled = true }: ImportRecordsOptions = {}) => {
    const t = useTranslations()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: ImportInput) => postImportRecords(input, channelHint),
        scope: { id: IMPORT_SCOPE_ID },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.CHECKER.ALL }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.PROFILE.ALL }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.USERS.ALL }),
                queryClient.invalidateQueries({ queryKey: QUERY_KEY.EAMUSEMENT.ALL }),
            ])

            if (isSuccessToastEnabled) toast.success(t('settings.eamusementImportSuccess'))
        },
    })
}

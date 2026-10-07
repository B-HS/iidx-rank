import type { FC, PropsWithChildren } from 'react'
import { useTranslations } from 'next-intl'
import { getHandoffErrorKey } from '@entities/eamusement/eamusement-error'
import { IMPORT_MESSAGE_VALUES } from '@shared/constants/eamusement-display'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'

type EamusementHandoffFailureProps = PropsWithChildren<{
    code: string
}>

export const EamusementHandoffFailure: FC<EamusementHandoffFailureProps> = ({ code, children }) => {
    const t = useTranslations()

    return (
        <Empty role='alert' className='min-h-64 border-0'>
            <EmptyHeader>
                <EmptyTitle>{t('import.failureTitle')}</EmptyTitle>
                <EmptyDescription>{t(getHandoffErrorKey(code), IMPORT_MESSAGE_VALUES)}</EmptyDescription>
            </EmptyHeader>
            {children}
        </Empty>
    )
}

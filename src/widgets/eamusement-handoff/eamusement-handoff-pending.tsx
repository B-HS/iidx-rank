import type { FC } from 'react'
import { useTranslations } from 'next-intl'
import { EamusementHandoffProgress } from '@features/eamusement-handoff-progress/eamusement-handoff-progress'

export const EamusementHandoffPending: FC = () => {
    const t = useTranslations('import')

    return <EamusementHandoffProgress title={t('waitingTitle')} description={t('waitingDescription')} />
}

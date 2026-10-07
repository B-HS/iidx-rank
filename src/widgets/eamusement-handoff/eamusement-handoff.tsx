'use client'
import { type FC, useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { parseHandoffPayload, readHandoffMessage, sendHandoffReady, sendHandoffResult } from '@entities/eamusement/eamusement-handoff'
import { EamusementHandoffFailure } from '@features/eamusement-handoff-failure/eamusement-handoff-failure'
import { IMPORT_HANDOFF_WAIT_MS } from '@shared/constants/eamusement'
import { Link } from '@shared/i18n/navigation'
import { Button } from '@shared/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@shared/ui/empty'
import { EamusementHandoffPending } from '@widgets/eamusement-handoff/eamusement-handoff-pending'
import { EamusementHandoffUpload } from '@widgets/eamusement-handoff/eamusement-handoff-upload'

type EamusementHandoffProps = {
    initialUserId: string | null
}

type ReceivedHandoff = {
    handoffId: string
    payload: ReturnType<typeof parseHandoffPayload>
}

export const EamusementHandoff: FC<EamusementHandoffProps> = ({ initialUserId }) => {
    const seenHandoffIdsRef = useRef<ReadonlySet<string>>(new Set())
    const [handoff, setHandoff] = useState<ReceivedHandoff | null>(null)
    const [isExtensionSilent, setIsExtensionSilent] = useState(false)
    const t = useTranslations('import')
    const settingsLink = (
        <Button variant='outline' size='sm' asChild>
            <Link href='/settings'>{t('guideSettingsLink')}</Link>
        </Button>
    )

    useEffect(() => {
        const startWaiting = () => window.setTimeout(() => setIsExtensionSilent(true), IMPORT_HANDOFF_WAIT_MS)
        let waitTimerId = startWaiting()
        const handleMessage = (event: MessageEvent<unknown>) => {
            const message = readHandoffMessage(event, window)

            if (!message) return

            window.clearTimeout(waitTimerId)

            if (message.type === 'hello') {
                setIsExtensionSilent(false)
                waitTimerId = startWaiting()
                sendHandoffReady(window)
                return
            }

            if (message.type === 'none') {
                setIsExtensionSilent(true)
                return
            }

            if (seenHandoffIdsRef.current.has(message.handoffId)) return

            const payload = parseHandoffPayload(message.payload)

            seenHandoffIdsRef.current = new Set([...seenHandoffIdsRef.current, message.handoffId])

            if (payload.status !== 'VALID') sendHandoffResult(window, message.handoffId, { status: 'failed', code: payload.status })

            setHandoff({ handoffId: message.handoffId, payload })
        }

        window.addEventListener('message', handleMessage)
        sendHandoffReady(window)

        return () => {
            window.removeEventListener('message', handleMessage)
            window.clearTimeout(waitTimerId)
        }
    }, [])

    if (handoff === null && isExtensionSilent) {
        return (
            <Empty className='min-h-64 border-0'>
                <EmptyHeader>
                    <EmptyTitle>{t('guideTitle')}</EmptyTitle>
                    <EmptyDescription>{t('guideDescription')}</EmptyDescription>
                </EmptyHeader>
                {settingsLink}
            </Empty>
        )
    }

    if (handoff === null) return <EamusementHandoffPending />
    if (handoff.payload.status !== 'VALID') return <EamusementHandoffFailure code={handoff.payload.status}>{settingsLink}</EamusementHandoffFailure>

    return (
        <EamusementHandoffUpload key={handoff.handoffId} handoffId={handoff.handoffId} input={handoff.payload.input} initialUserId={initialUserId} />
    )
}

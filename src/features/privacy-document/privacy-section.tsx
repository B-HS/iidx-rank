import type { FC, PropsWithChildren } from 'react'

type PrivacySectionProps = PropsWithChildren<{
    id: string
    title: string
}>

export const PrivacySection: FC<PrivacySectionProps> = ({ id, title, children }) => (
    <section aria-labelledby={id} className='grid min-w-0 gap-3'>
        <h2 id={id} className='text-base font-semibold tracking-tight'>
            {title}
        </h2>
        {children}
    </section>
)

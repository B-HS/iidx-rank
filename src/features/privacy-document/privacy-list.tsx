import type { FC } from 'react'

type PrivacyListProps = {
    title?: string
    items: readonly { id: string; text: string }[]
}

export const PrivacyList: FC<PrivacyListProps> = ({ title, items }) => (
    <div className='grid min-w-0 gap-2'>
        {title ? <h3 className='text-sm font-medium'>{title}</h3> : null}
        <ul className='grid min-w-0 list-disc gap-1.5 pl-5 marker:text-muted-foreground'>
            {items.map((item) => (
                <li key={item.id} className='min-w-0 break-words'>
                    {item.text}
                </li>
            ))}
        </ul>
    </div>
)

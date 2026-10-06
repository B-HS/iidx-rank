import type { ComponentProps, FC, PropsWithChildren } from 'react'
import { ShellPageHeader } from '@widgets/app-shell/shell-page-header'

type BoardFrameProps = PropsWithChildren<Pick<ComponentProps<typeof ShellPageHeader>, 'title' | 'actions'>>

export const BoardFrame: FC<BoardFrameProps> = ({ title, actions, children }) => (
    <section className='flex min-w-0 flex-1 flex-col md:h-full md:min-h-0 md:overflow-hidden'>
        <ShellPageHeader title={title} actions={actions} />
        <div className='flex min-w-0 flex-1 flex-col md:min-h-0 md:overflow-auto'>{children}</div>
    </section>
)

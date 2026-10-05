import { type FC } from 'react'

import { MESSAGES } from '@shared/messages/messages'
import { CheckerLoading } from '@widgets/checker-workspace/checker-loading'

const LoadingPage: FC = () => <CheckerLoading label={MESSAGES.common.loading} />

export default LoadingPage

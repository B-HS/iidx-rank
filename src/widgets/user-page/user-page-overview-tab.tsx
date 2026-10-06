'use client'
import type { FC } from 'react'
import { LAMPS } from '@entities/checker/checker.dto'
import { NO_PLAY_LAMP } from '@entities/profile/profile.dto'
import { useProfileRecords } from '@entities/profile/profile.query'
import { ProfileLampSummary } from '@features/profile-lamp-summary/profile-lamp-summary'
import { ProfileRecordsStatus } from '@features/profile-records-status/profile-records-status'
import type { UserPageTabProps } from '@widgets/user-page/user-page-tabs'

const PLAYED_LAMPS = LAMPS.filter((lamp) => lamp !== NO_PLAY_LAMP).toReversed()

export const UserPageOverviewTab: FC<UserPageTabProps> = ({ handle }) => {
    const recordsQuery = useProfileRecords(handle)

    if (!recordsQuery.data)
        return (
            <ProfileRecordsStatus isError={recordsQuery.isError} isRetrying={recordsQuery.isFetching} onRetry={() => void recordsQuery.refetch()} />
        )

    const playedRecords = recordsQuery.data.records.filter((record) => record.lamp !== NO_PLAY_LAMP)
    const items = PLAYED_LAMPS.map((lamp) => ({ lamp, count: playedRecords.filter((record) => record.lamp === lamp).length }))

    return <ProfileLampSummary items={items} total={playedRecords.length} />
}

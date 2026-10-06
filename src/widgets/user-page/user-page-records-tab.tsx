'use client'
import type { FC } from 'react'
import { NO_PLAY_LAMP } from '@entities/profile/profile.dto'
import { useProfileRecords } from '@entities/profile/profile.query'
import { ProfileRecordList } from '@features/profile-record-list/profile-record-list'
import { ProfileRecordsStatus } from '@features/profile-records-status/profile-records-status'
import type { UserPageTabProps } from '@widgets/user-page/user-page-tabs'

export const UserPageRecordsTab: FC<UserPageTabProps> = ({ handle }) => {
    const recordsQuery = useProfileRecords(handle)

    if (!recordsQuery.data) return <ProfileRecordsStatus isError={recordsQuery.isError} />

    return <ProfileRecordList records={recordsQuery.data.records.filter((record) => record.lamp !== NO_PLAY_LAMP)} />
}

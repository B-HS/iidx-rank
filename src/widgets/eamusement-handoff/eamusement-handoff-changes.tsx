'use client'
import type { FC } from 'react'
import { toImportChangeRows } from '@entities/eamusement/eamusement-change-rows'
import type { ImportResult } from '@entities/eamusement/eamusement.dto'
import { useCatalog } from '@entities/catalog/catalog.query'
import { EamusementChangeTable } from '@features/eamusement-change-table/eamusement-change-table'

type EamusementHandoffChangesProps = {
    changes: ImportResult['changes']
}

export const EamusementHandoffChanges: FC<EamusementHandoffChangesProps> = ({ changes }) => {
    const { data: catalog } = useCatalog()

    return <EamusementChangeTable rows={toImportChangeRows(changes, catalog.charts)} />
}

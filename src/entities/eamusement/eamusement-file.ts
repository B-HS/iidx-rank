import { z } from 'zod'
import { ImportInputSchema } from '@entities/eamusement/eamusement.dto'
import { IMPORT_MAX_BODY_BYTES, IMPORT_STYLE, IMPORT_VERSION } from '@shared/constants/eamusement'

const ImportHeaderSchema = z.looseObject({ version: z.unknown(), style: z.unknown() })

export const parseImportText = (text: string) => {
    let raw: unknown

    try {
        raw = JSON.parse(text)
    } catch {
        return { status: 'MALFORMED' } as const
    }

    const header = ImportHeaderSchema.safeParse(raw)

    if (!header.success) return { status: 'INVALID' } as const
    if (typeof header.data.version === 'number' && header.data.version !== IMPORT_VERSION) return { status: 'VERSION_MISMATCH' } as const
    if (header.data.style === IMPORT_STYLE.DP) return { status: 'UNSUPPORTED_STYLE' } as const

    const input = ImportInputSchema.safeParse(raw)

    if (!input.success) return { status: 'INVALID' } as const

    return { status: 'VALID', input: input.data } as const
}

export const parseImportFile = async (file: Pick<File, 'size' | 'text'>) => {
    if (file.size > IMPORT_MAX_BODY_BYTES) return { status: 'TOO_LARGE' } as const

    try {
        return parseImportText(await file.text())
    } catch {
        return { status: 'MALFORMED' } as const
    }
}

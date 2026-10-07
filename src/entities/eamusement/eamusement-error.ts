type ImportErrorKey =
    | 'settings.eamusementImportCooldown'
    | 'settings.eamusementImportAuthRequired'
    | 'settings.eamusementFileTooLarge'
    | 'settings.eamusementFileInvalid'
    | 'settings.eamusementFileDp'
    | 'settings.eamusementImportError'
    | 'auth.originRejected'
    | 'auth.serviceUnavailable'

const IMPORT_FILE_ERROR_KEYS = {
    TOO_LARGE: 'settings.eamusementFileTooLarge',
    MALFORMED: 'settings.eamusementFileMalformed',
    INVALID: 'settings.eamusementFileInvalid',
    VERSION_MISMATCH: 'settings.eamusementFileVersionMismatch',
    UNSUPPORTED_STYLE: 'settings.eamusementFileDp',
} as const

const IMPORT_ERROR_KEYS = new Map<string, ImportErrorKey>([
    ['IMPORT_COOLDOWN', 'settings.eamusementImportCooldown'],
    ['AUTH_REQUIRED', 'settings.eamusementImportAuthRequired'],
    ['PAYLOAD_TOO_LARGE', 'settings.eamusementFileTooLarge'],
    ['INVALID_INPUT', 'settings.eamusementFileInvalid'],
    ['MALFORMED_JSON', 'settings.eamusementFileInvalid'],
    ['UNSUPPORTED_MEDIA_TYPE', 'settings.eamusementFileInvalid'],
    ['UNSUPPORTED_STYLE', 'settings.eamusementFileDp'],
    ['ORIGIN_NOT_ALLOWED', 'auth.originRejected'],
    ['AUTH_UNAVAILABLE', 'auth.serviceUnavailable'],
])

export const getImportFileErrorKey = (status: keyof typeof IMPORT_FILE_ERROR_KEYS) => IMPORT_FILE_ERROR_KEYS[status]

export const getImportErrorKey = (code: string) => IMPORT_ERROR_KEYS.get(code) ?? 'settings.eamusementImportError'

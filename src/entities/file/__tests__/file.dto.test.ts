import { describe, expect, test } from 'bun:test'
import { FILE_UPLOAD_RULES, FileKeySchema, ImageExtensionSchema } from '@entities/file/file.dto'
import { IMAGE_EXTENSION_BY_MIME } from '@entities/file/file-signature'

const UUID = '3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b'

describe('파일 키 패턴', () => {
    test('용도와 확장자가 맞는 키를 허용합니다', () => {
        for (const purpose of ['avatar', 'board'])
            for (const extension of Object.values(IMAGE_EXTENSION_BY_MIME))
                expect(FileKeySchema.safeParse(`${purpose}/${UUID}.${extension}`).success).toBe(true)
    })
    test('경로 이탈·중복 슬래시·인코딩·알 수 없는 용도·확장자를 거부합니다', () => {
        for (const key of [
            `avatar/../${UUID}.png`,
            `avatar//${UUID}.png`,
            `avatar/%2e%2e${UUID}.png`,
            `other/${UUID}.png`,
            `board/${UUID}.svg`,
            `board/${UUID}.png/`,
            `/board/${UUID}.png`,
            `board/${UUID.slice(1)}.png`,
        ])
            expect(FileKeySchema.safeParse(key).success).toBe(false)
    })
    test('확장자 스키마는 매핑된 확장자만 허용합니다', () => {
        expect(ImageExtensionSchema.safeParse('png').success).toBe(true)
        expect(ImageExtensionSchema.safeParse('svg').success).toBe(false)
    })
})

describe('용도별 업로드 규칙', () => {
    test('avatar는 GIF를 허용하지 않고 board는 허용합니다', () => {
        expect(FILE_UPLOAD_RULES.avatar.mimeTypes).not.toContain('image/gif')
        expect(FILE_UPLOAD_RULES.board.mimeTypes).toContain('image/gif')
    })
})

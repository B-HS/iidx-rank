import { describe, expect, test } from 'bun:test'
import { IMAGE_EXTENSION_BY_MIME, IMAGE_MIME_BY_EXTENSION, detectImageMime } from '@entities/file/file-signature'

const withPadding = (signature: number[]) => new Uint8Array([...signature, 0x00, 0x00, 0x00, 0x00])
const webpBytes = (fourcc: string) =>
    new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, ...new TextEncoder().encode(fourcc), 0x56, 0x50, 0x38, 0x20])

describe('이미지 매직 바이트 판정', () => {
    test('JPEG를 판정합니다', () => {
        expect(detectImageMime(withPadding([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg')
    })
    test('PNG를 판정합니다', () => {
        expect(detectImageMime(withPadding([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe('image/png')
    })
    test('GIF87a와 GIF89a를 판정합니다', () => {
        expect(detectImageMime(withPadding([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]))).toBe('image/gif')
        expect(detectImageMime(withPadding([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]))).toBe('image/gif')
    })
    test('WebP를 판정합니다', () => {
        expect(detectImageMime(webpBytes('WEBP'))).toBe('image/webp')
    })
    test('RIFF이지만 WEBP가 아니면 거부합니다', () => {
        expect(detectImageMime(webpBytes('WAVE'))).toBeNull()
    })
    test('SVG와 HTML은 거부합니다', () => {
        expect(detectImageMime(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull()
        expect(detectImageMime(new TextEncoder().encode('<!doctype html><html></html>'))).toBeNull()
    })
    test('빈 버퍼와 짧은 버퍼는 거부합니다', () => {
        expect(detectImageMime(new Uint8Array())).toBeNull()
        expect(detectImageMime(new Uint8Array([0xff, 0xd8]))).toBeNull()
        expect(detectImageMime(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42]))).toBeNull()
    })
})

describe('MIME 확장자 매핑', () => {
    test('MIME과 확장자 매핑이 서로 역방향입니다', () => {
        const inverted = Object.entries(IMAGE_MIME_BY_EXTENSION).map(([extension, mime]) => [mime, extension])
        expect(inverted.toSorted()).toEqual(Object.entries(IMAGE_EXTENSION_BY_MIME).toSorted())
    })
})

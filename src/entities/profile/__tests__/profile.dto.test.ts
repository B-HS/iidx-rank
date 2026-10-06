import { describe, expect, mock, test } from 'bun:test'
import {
    PROFILE_BIO_MAX_LENGTH,
    PROFILE_NAME_MAX_LENGTH,
    ProfileBioSchema,
    ProfileNameSchema,
    ProfileUpdateInputSchema,
} from '@entities/profile/profile.dto'
import { HandleSchema } from '@entities/profile/user-summary.dto'

mock.module('server-only', () => ({}))

const { createDefaultHandle } = await import('@entities/profile/user-summary.server')

const USER_ID = '3F2B8C1E-5a47-4d9e-9b3a-1c2d3e4f5a6b'
const AVATAR_KEY = 'avatar/3f2b8c1e-5a47-4d9e-9b3a-1c2d3e4f5a6b.png'
const VALID_INPUT = { name: '닉네임', handle: 'iidx_player', bio: '', isPublic: false, avatarKey: null }

describe('핸들 패턴', () => {
    test('영문 소문자·숫자·밑줄 3~20자를 허용합니다', () => {
        for (const handle of ['abc', 'a_1', 'user_3f2b8c1e5a47', 'a'.repeat(20), '___', '012'])
            expect(HandleSchema.safeParse(handle).success).toBe(true)
    })
    test('길이·대문자·허용되지 않은 문자를 거부합니다', () => {
        for (const handle of ['', 'ab', 'a'.repeat(21), 'Abc', 'ABC', 'a-b', 'a.b', 'a b', '한글핸들', 'abc/', 'abc\n', ' abc'])
            expect(HandleSchema.safeParse(handle).success).toBe(false)
    })
})

describe('닉네임 길이', () => {
    test('1~40자를 허용하고 앞뒤 공백을 제거합니다', () => {
        expect(ProfileNameSchema.parse('가')).toBe('가')
        expect(ProfileNameSchema.parse(`  ${'가'.repeat(PROFILE_NAME_MAX_LENGTH)}  `)).toBe('가'.repeat(PROFILE_NAME_MAX_LENGTH))
    })
    test('빈 값·공백만 있는 값·41자를 거부합니다', () => {
        for (const name of ['', '   ', '가'.repeat(PROFILE_NAME_MAX_LENGTH + 1)]) expect(ProfileNameSchema.safeParse(name).success).toBe(false)
    })
})

describe('소개 길이', () => {
    test('빈 값과 300자를 허용합니다', () => {
        for (const bio of ['', '가'.repeat(PROFILE_BIO_MAX_LENGTH)]) expect(ProfileBioSchema.safeParse(bio).success).toBe(true)
    })
    test('301자를 거부합니다', () => {
        expect(ProfileBioSchema.safeParse('가'.repeat(PROFILE_BIO_MAX_LENGTH + 1)).success).toBe(false)
    })
})

describe('프로필 수정 입력', () => {
    test('사진이 없거나 파일 키 패턴에 맞는 입력을 허용합니다', () => {
        expect(ProfileUpdateInputSchema.safeParse(VALID_INPUT).success).toBe(true)
        expect(ProfileUpdateInputSchema.safeParse({ ...VALID_INPUT, avatarKey: AVATAR_KEY }).success).toBe(true)
    })
    test('알 수 없는 필드·잘못된 파일 키·누락된 필드를 거부합니다', () => {
        expect(ProfileUpdateInputSchema.safeParse({ ...VALID_INPUT, userId: USER_ID }).success).toBe(false)
        expect(ProfileUpdateInputSchema.safeParse({ ...VALID_INPUT, avatarKey: '../secret.png' }).success).toBe(false)
        expect(ProfileUpdateInputSchema.safeParse({ name: VALID_INPUT.name, handle: VALID_INPUT.handle }).success).toBe(false)
    })
})

describe('기본 핸들', () => {
    test('UUID에서 만든 기본 핸들은 핸들 패턴을 만족합니다', () => {
        const handle = createDefaultHandle(USER_ID)

        expect(handle).toBe('user_3f2b8c1e5a47')
        expect(HandleSchema.safeParse(handle).success).toBe(true)
    })
    test('임의로 생성한 UUID의 기본 핸들도 핸들 패턴을 만족합니다', () => {
        expect(HandleSchema.safeParse(createDefaultHandle(crypto.randomUUID())).success).toBe(true)
    })
})

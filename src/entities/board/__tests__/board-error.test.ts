import { describe, expect, test } from 'bun:test'
import { getBoardErrorKey } from '@entities/board/board-error'
import { API_REQUEST_FAILED_CODE, getApiErrorCode } from '@shared/lib/api-client'

describe('게시판 오류 안내', () => {
    test('작성 제한·권한·입력 오류를 구분합니다', () => {
        expect(getBoardErrorKey('RATE_LIMITED')).toBe('board.errorRateLimited')
        expect(getBoardErrorKey('FORBIDDEN')).toBe('board.errorForbidden')
        expect(getBoardErrorKey('VALIDATION_ERROR')).toBe('board.errorInvalidInput')
        expect(getBoardErrorKey('INVALID_CONTENT')).toBe('board.errorInvalidInput')
    })

    test('안내가 정해지지 않은 코드는 null을 반환합니다', () => {
        expect(getBoardErrorKey('POST_NOT_FOUND')).toBeNull()
        expect(getBoardErrorKey(API_REQUEST_FAILED_CODE)).toBeNull()
    })
})

describe('API 오류 코드 추출', () => {
    test('cause에 실린 서버 코드를 읽습니다', () => {
        expect(getApiErrorCode(new Error('작성이 너무 잦습니다.', { cause: { code: 'RATE_LIMITED' } }))).toBe('RATE_LIMITED')
    })

    test('코드가 없는 오류와 오류가 아닌 값은 공통 실패 코드로 처리합니다', () => {
        expect(getApiErrorCode(new Error('failed'))).toBe(API_REQUEST_FAILED_CODE)
        expect(getApiErrorCode(new Error('failed', { cause: 'RATE_LIMITED' }))).toBe(API_REQUEST_FAILED_CODE)
        expect(getApiErrorCode(null)).toBe(API_REQUEST_FAILED_CODE)
    })
})

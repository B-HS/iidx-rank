import { describe, expect, test } from 'bun:test'
import { nextCheckerLamp } from '@entities/checker/checker-lamp'
describe('노멀 모드 램프 순환', () => {
    test('NO_PLAY에서 EASY, CLEAR를 거쳐 NO_PLAY로 돌아옵니다', () => {
        expect(nextCheckerLamp('NO_PLAY', 'normal')).toBe('EASY')
        expect(nextCheckerLamp('EASY', 'normal')).toBe('CLEAR')
        expect(nextCheckerLamp('CLEAR', 'normal')).toBe('NO_PLAY')
    })
    test('FAILED와 ASSIST는 EASY로 올라갑니다', () => {
        expect(nextCheckerLamp('FAILED', 'normal')).toBe('EASY')
        expect(nextCheckerLamp('ASSIST', 'normal')).toBe('EASY')
    })
    test('HARD, EX_HARD, FULL_COMBO는 내려가지 않고 유지합니다', () => {
        expect(nextCheckerLamp('HARD', 'normal')).toBe('HARD')
        expect(nextCheckerLamp('EX_HARD', 'normal')).toBe('EX_HARD')
        expect(nextCheckerLamp('FULL_COMBO', 'normal')).toBe('FULL_COMBO')
    })
})
describe('하드 모드 램프 순환', () => {
    test('NO_PLAY, FAILED, ASSIST, EASY, CLEAR는 HARD로 올라갑니다', () => {
        expect(nextCheckerLamp('NO_PLAY', 'hard')).toBe('HARD')
        expect(nextCheckerLamp('FAILED', 'hard')).toBe('HARD')
        expect(nextCheckerLamp('ASSIST', 'hard')).toBe('HARD')
        expect(nextCheckerLamp('EASY', 'hard')).toBe('HARD')
        expect(nextCheckerLamp('CLEAR', 'hard')).toBe('HARD')
    })
    test('HARD는 EX_HARD로, EX_HARD는 NO_PLAY로 순환합니다', () => {
        expect(nextCheckerLamp('HARD', 'hard')).toBe('EX_HARD')
        expect(nextCheckerLamp('EX_HARD', 'hard')).toBe('NO_PLAY')
    })
    test('FULL_COMBO는 내려가지 않고 유지합니다', () => {
        expect(nextCheckerLamp('FULL_COMBO', 'hard')).toBe('FULL_COMBO')
    })
})

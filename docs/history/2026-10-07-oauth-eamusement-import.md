# 외부 로그인·e-amusement 가져오기·익스텐션 연동

날짜: 2026-10-07

## 한 일

- GitHub·Naver 외부 로그인. better-auth 내장 프로바이더와 `oAuthProxy`(운영 출처 2개 대응), OAuth 토큰 암호화 저장, 로그인 대화상자의 외부 로그인 버튼과 실패 안내.
- 기록 이력. `user_record`에 EX SCORE·MISS COUNT·출처 열을 더하고 `user_record_history`에 모든 변경을 추가합니다. 기존 기록은 마이그레이션 0005가 이력으로 옮깁니다.
- e-amusement 가져오기. `eamusement_import` 테이블, `POST /api/import/records`, `GET /api/import/status`, `GET /api/extension/session`, 설정 화면의 가져오기 섹션, 프로필의 플레이어 정보, 차트 상세의 EX SCORE·MISS COUNT.
- 익스텐션(iidx-data-parser) 쪽 작업은 그 저장소의 `docs/PROCESS.md`에 있습니다.

## 진행 방식

Workflow 도구 1회(에이전트 8개). 조사 3건(better-auth, Chrome 익스텐션, 파서 검증 리뷰) → 저장소별 서버·코어(Opus) → 화면(Sonnet) → 교차 리뷰(Opus). 이후 main이 리뷰 지적을 직접 반영했습니다.

## 교차 리뷰 뒤 main이 바꾼 것

- 오래된 데이터가 최신 기록을 덮던 문제: 현재 기록이 관측 시각(`generatedAt`과 수신 시각 중 이른 쪽)보다 나중이면 건너뜁니다.
- 가져온 `scoreGrade`·`exScore`·`missCount`의 `null`은 값 없음으로 보고 기존 값을 유지합니다.
- 프로필과 가져오기 상태의 플레이어 정보는 DJ NAME이 있는 가장 최근 가져오기에서 읽습니다.
- `account.encryptOAuthTokens`를 켰습니다.
- 가져오기 본문의 이중 Zod 검증을 없앴습니다.
- 계약 문서를 실제 동작(계정 연결 조건, 캐시 태그, 상태 응답 형태)에 맞췄습니다.

## 검증

임시 SQLite(`file:./data/verify-import.db`)에서만 실행했습니다.

| 검사                                       | 결과                                                                                                                                                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run db:migrate`                       | 새 DB에서 성공                                                                                                                                                                                                                               |
| backfill(0000~0004 적용 → 표본 3행 → 0005) | 이력 3행, 기존 값과 메모 보존                                                                                                                                                                                                                |
| `bun run typecheck`                        | 오류 0                                                                                                                                                                                                                                       |
| `bun test`                                 | 181 pass                                                                                                                                                                                                                                     |
| `bun run lint`                             | 오류 0, 기존 경고 4                                                                                                                                                                                                                          |
| `bun run build`                            | 성공                                                                                                                                                                                                                                         |
| 통합 스크립트(실제 저장 함수 32개 단언)    | 통과                                                                                                                                                                                                                                         |
| 로컬 서버 HTTP                             | 세션 없음 `user: null`, 가입 후 세션 응답, 출처 없음·모르는 출처 403, 쿠키 없음 401, 잘못된 본문 400, DP 400, 익스텐션 출처 200(일치 1·변경 1·미일치 1), 재시도 429, 상태·기록 조회, GitHub 인가 URL 생성, 꺼진 Naver는 `PROVIDER_NOT_FOUND` |
| 브라우저                                   | 설정 화면 가져오기 섹션이 실제 데이터로 표시됨                                                                                                                                                                                               |

미검증 항목은 `docs/quality-assurance/2026-10-07-oauth-eamusement-import.md`에 있습니다.

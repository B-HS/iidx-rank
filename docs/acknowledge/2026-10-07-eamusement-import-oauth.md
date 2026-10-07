# 외부 로그인·e-amusement 가져오기·익스텐션 연동 결정

날짜: 2026-10-07

## 사용자 결정

| 항목 | 결정 |
| --- | --- |
| 익스텐션의 사용자 식별 | 브라우저의 iidx-rank 세션을 그대로 사용합니다. 익스텐션에 iidx-rank 출처 권한을 주고 서버는 익스텐션 출처만 허용합니다 |
| 목록의 "oauth 추가" | GitHub·Naver 프로바이더 서버 설정으로 해석합니다. iidx-rank를 OAuth 제공자로 만들지 않습니다 |
| 네이버 환경변수 이름 | `NAVER_CLIENT_ID`. 요청 메시지의 `NAVERE_CLIENT_ID`는 오타로 봅니다 |
| 충돌 정책 | 과거 기록도 남겨야 하므로 새 데이터를 insert하고 조회는 최신 데이터로 합니다 |
| 저장 범위 | 차트 기록 확장(EX SCORE·MISS COUNT·출처)과 플레이어 정보(DJ NAME·IIDX ID·단위·노트레이더·동기화 시각) |
| 카카오 로그인 | 이번 범위 밖. TODO |
| 진행 방식 | Workflow 도구로 오케스트레이션. main Opus, 단계별 Opus·Sonnet. Fable·서브에이전트·general-purpose 에이전트는 쓰지 않습니다 |

## main의 해석과 기본값

- 충돌 정책의 구현: 모든 변경을 `user_record_history`에 insert하고, `user_record`는 차트별 최신 값을 담는 조회용 테이블로 유지합니다. 기존 조회 경로와 캐시 계약을 바꾸지 않으면서 이력을 남기기 위함입니다.
- 가져온 램프가 `NO_PLAY`이면 값이 없는 것으로 보고 건너뜁니다. 미플레이 표시가 수동 기록을 지우지 않게 하기 위함입니다.
- 수동 수정도 같은 이력 테이블에 남깁니다. 메모만 바꾼 저장은 이력을 만들지 않습니다.
- 반영 대상은 SP 레벨 12입니다. catalog의 `chartId`가 곡명과 패턴 종류만으로 만들어져 DP·다른 레벨과 충돌할 수 있기 때문입니다.
- IIDX ID는 공개 프로필에 노출하지 않고 본인 설정 화면에만 표시합니다.
- 익스텐션 i18n은 Chrome 공식 `chrome.i18n`(`_locales` ko·ja·en)을 쓰고 브라우저 언어를 따릅니다.
- 익스텐션은 번들러가 Bun.build라 babel 파이프라인이 없어 React Compiler를 넣지 않습니다. 수동 메모이제이션이 필요 없도록 구조를 바꿉니다. 컨벤션(frontend.md §4)과 다른 지점입니다.
- 운영 DB 마이그레이션은 push 후 Vercel 빌드에서 실행되므로 iidx-rank의 push는 사용자 확인 뒤에 합니다.

세부 계약은 `docs/E-AMUSEMENT.md`에 있습니다.

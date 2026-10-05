# Sticky 헤더 레이어·목록 하단 여백·일일 원본 갱신

사용자가 서브에이전트 없이 main 직접 진행을 선택했습니다.

## 원인과 수정

- 모바일 390×844 운영 화면에서 B 고정 헤더 위로 세 열의 회색 램프가 비쳤습니다. 헤더와 카드의 절대 위치 램프가 모두 z-index 10이었습니다. 램프는 pointer-events:none이므로 elementFromPoint 결과만으로는 페인팅 겹침을 판정할 수 없어 실제 스크린샷으로 재현했습니다.
- src/app/globals.css에 --z-rank-header:30을 추가하고 공통 checker-rank-header에 적용했습니다. 콘텐츠 툴바 20과 카드 램프 10보다 높고, Dialog overlay/content 50보다 낮습니다.
- --checker-list-bottom-padding:9rem을 공통 checker-list-scroll의 padding-block-end에 적용했습니다. 실제 화면과 스켈레톤이 같은 목록 클래스를 사용합니다. html/body에는 여백을 추가하지 않았습니다.
- 모바일의 native 문서 스크롤, 데스크톱의 내부 목록 스크롤, 랭크의 접기 동작은 유지했습니다.

## 검증

- .env 없는 검증 복사본에서 bun --no-env-file run build 성공: TypeScript, KO/JA/EN PPR, Cache Components 포함.
- globals.css Prettier 검사 성공.
- 390×844: B 헤더 top 48px / z-index 30, 램프 비침 제거 스크린샷 확인. 목록 하단과 마지막 섹션 사이 144px, html/body padding 0, 수평 초과 0, body overflow visible.
- 1280×844: B 헤더 top 48px / z-index 30, 목록 overflow auto, body overflow hidden, 문서 높이 844px / 문서 scrollY 0. 목록 하단과 마지막 섹션 사이 144px.
- B 접기 aria-expanded false / 재열기 true. 곡 필터 Dialog와 overlay는 z-index 50으로 상위 레이어 유지.
- 실제 iPhone OS 상태 표시줄 탭은 이번 CSS 레이어/여백 검증 범위에서 실행하지 않았습니다.

## 자동 원본 갱신 확인

- vercel.json의 /api/catalog/sync, 0 18 * * * 설정을 확인했습니다. Vercel Cron은 UTC이므로 한국/일본 시간 매일 03:00 예약입니다.
- Vercel 운영 프로젝트 API에서 crons.disabledAt:null, 해당 path/schedule과 현재 Production deploymentId 일치를 확인했습니다. Production CRON_SECRET 등록 여부만 확인했으며 값을 읽거나 출력하지 않았습니다.
- GET 경로는 Cron Bearer 인증 후 수집합니다. 동일 UTC 날짜에 수집했다면 중복을 생략합니다. POST는 서버에서 admin role을 확인해 수동 수집합니다. 원본 수집 후 DB 저장·CATALOG_CACHE_TAG 무효화를 수행하고, 일반 조회는 DB만 읽습니다.
- 이 작업은 활성 예약과 인증 설정을 확인한 것이며 예약 호출 성공 로그를 확인하거나 원본 수집을 수동 실행한 것은 아닙니다. Hobby 플랜의 실행 시각은 예약 시간대 내 지연될 수 있습니다.
- 공식 근거: https://vercel.com/docs/cron-jobs (UTC), https://vercel.com/docs/cron-jobs/usage-and-pricing (Hobby 일일 주기/시간 정밀도).

## 운영 반영

GitHub push와 Production 화면 확인 진행 중입니다.

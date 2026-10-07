# 캐시와 갱신 계약

## 요청 순서

1. 정적 레이아웃과 로딩 UI는 미리 렌더합니다. 세션·개인 데이터는 Suspense 경계 아래에서 요청마다 인증합니다.
2. 인증 결과의 UUID만 기록 조회에 전달합니다. 세션 토큰·이메일·비밀번호는 캐시 키나 태그에 넣지 않습니다.
3. 페이지와 catalog GET은 저장된 DB만 읽습니다. HTML 수집은 하루 1회 Production Cron 또는 관리자 수동 갱신 경로에서만 실행합니다. 빌드에서는 외부 수집을 실행하지 않습니다.
4. 서버 QueryClient는 요청마다 생성합니다. 서버 DB 캐시 loader를 같은 queryOptions 팩토리에 주입하여 prefetchQuery하고 HydrationBoundary로 전달합니다.

## 서버와 클라이언트의 역할

| 데이터 | 서버 캐시 | 클라이언트 캐시 | HTTP 응답 |
|---|---|---|---|
| 공개 난이도표 | use cache + catalog 태그 + snapshot revision | catalog/list, 5분 신선도 | private, no-store |
| 사용자 기록 | UUID + revision, user 태그, 60초 재검증 | checker/records/UUID, 기본 60초 | private, no-store |
| 표시 설정 | UUID + revision, user:<uuid>:display-preferences 태그, 60초 재검증 | preferences/display/UUID, 기본 60초 | private, no-store |
| 프로필·e-amusement 정보 | 서버 캐시 없음, 요청마다 DB 조회 | 화면 단계의 query key에 따름 | private, no-store |
| 가져오기 상태 | 서버 캐시 없음, 요청마다 DB 조회 | 화면 단계의 query key에 따름 | private, no-store |
| 인증 세션 | 요청마다 검증 | better-auth의 인증 수명에 따름 | 공유 캐시 불허 |

기록 변경 시 저장·revision 증가를 같은 DB 트랜잭션으로 처리합니다. Route Handler는 인증 사용자의 태그만 revalidateTag(tag,{expire:0})로 만료합니다. 클라이언트는 이어서 해당 query key를 invalidateQueries합니다. 로그인·로그아웃·계정 변경 시 기존 QueryClient를 clear하고 라우터를 새로고침합니다. 로그아웃 완료 직후 identity-transition UI gate를 닫고, 클라이언트 세션 UUID와 서버 초기 UUID가 일치할 때까지 이전 기록과 상세 메모를 숨깁니다. 상세 폼은 사용자 UUID와 곡 ID로 구분합니다.

POST /api/import/records는 eamusement_import 행 추가·기록 upsert·이력 추가·revision 증가를 같은 DB 트랜잭션으로 처리한 뒤 인증 사용자의 user:<uuid>:records 태그와 users:recent 태그를 revalidateTag(tag,{expire:0})로 만료합니다. revision은 기록이 하나라도 바뀔 때만 올립니다. 프로필 조회(GET /api/profiles/[handle], /u/[handle])와 GET /api/import/status는 use cache를 쓰지 않고 요청마다 DB를 읽으므로 프로필용 서버 태그가 없고, 가져오기 직후의 조회가 새 e-amusement 정보를 바로 돌려줍니다. 클라이언트는 가져오기 응답을 받은 뒤 기록·프로필·가져오기 상태 query key를 invalidateQueries합니다. GET /api/extension/session은 세션을 요청마다 검증하고 캐시하지 않습니다.

POST /api/cache/refresh는 로그인한 사용자 자신의 기록 캐시를 갱신합니다. POST /api/catalog/sync는 DB 역할이 admin인 사용자만 원본을 수집한 후 공개 캐시를 만료합니다. GET /api/catalog/sync는 CRON_SECRET Bearer 인증 후 UTC 당일 수집 여부를 확인해 중복 일일 수집을 생략합니다. 관리자 수동 수집에는 60초 쿨다운이 적용됩니다. 공개 DB 캐시의 5분 재검증은 HTML 수집 주기가 아닙니다. 난이도표 페이지(/table)의 정적 셸과 서버 프리페치가 쓰는 catalog 조회는 snapshot revision을 키에 넣지 않으므로, 태그를 만료하지 않는 CLI 수집(bun run source:sync) 직후에는 난이도표 첫 화면이 최대 약 5분 동안 이전 스냅샷일 수 있습니다. Cron과 관리자 수동 수집은 태그를 즉시 만료합니다. 사용자가 임의 사용자 ID·태그·원본 URL을 지정할 수 없습니다.

## 범위와 운영 경계

- 최신성은 게시된 Google Sheets 원본을 기준으로 합니다. 원본 작성자의 게시 지연이나 미게시 변경까지 읽을 수는 없습니다.
- 네트워크·파싱 실패는 정상 스냅샷을 덮어쓰지 않습니다. 수집시각으로 최신 여부를 판단합니다. 랭크·색상·곡 개수·중복 검증을 통과한 스냅샷만 반영합니다.
- 로컬 SQLite에서 역할·수집·기록 보존을 검증했고 Production은 Turso를 사용합니다. DB revision과 조건부 수집 잠금으로 서버 간 상태를 공유합니다. 다중 인스턴스 경합·장애 복구 검증은 별도 운영 검증 대상입니다.
- use cache는 영구 저장소가 아닙니다. 기록의 단일 출처는 DB이며 캐시가 사라져도 기록을 다시 조회할 수 있습니다.

## 공식 근거

- 설치본 Next 문서: node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md
- https://nextjs.org/docs/app/api-reference/directives/use-cache
- https://nextjs.org/docs/app/api-reference/functions/cacheLife
- https://nextjs.org/docs/app/api-reference/functions/cacheTag
- https://nextjs.org/docs/app/api-reference/functions/revalidateTag
- https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
- https://better-auth.com/docs/adapters/drizzle

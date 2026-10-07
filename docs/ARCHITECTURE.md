# 구현 계약

## 데이터

- catalog 응답: { charts, source }. chart: { id, title, difficulty: 'H'|'A'|'L', version, normalRank, hardRank, normalPersonal, hardPersonal }. rank: 'F'|'E'|'D'|'C'|'B'|'B+'|'A'|'A+'|'S'|'S+'|null. version은 원본 버전 이름 문자열. id는 정규화된 제목+패턴 종류 기반 안정적 식별자(랭크/정렬과 독립).
- source: { updatedAt: string|null, fetchedAt: ISO string|null, chartCount: number, status: 'ready'|'empty', url: string }. 원본 게시일과 서버 수집시각을 구분합니다. 파싱 실패 시 정상 저장된 데이터를 유지하며 성공으로 표시하지 않습니다.
- checker 응답: { userId, records }. record: { chartId, lamp: 'NO_PLAY'|'FAILED'|'ASSIST'|'EASY'|'CLEAR'|'HARD'|'EX_HARD'|'FULL_COMBO', scoreGrade: 'F'|'E'|'D'|'C'|'B'|'A'|'AA'|'AAA'|null, exScore: 0 이상 정수|null, missCount: 0 이상 정수|null, source: 'manual'|'eamusement', memo, updatedAt }. exScore·missCount·source는 스키마 기본값(null·null·'manual')이 있어 이전 형식의 응답도 그대로 파싱합니다. UUID는 서버 세션에서 얻습니다. 요청에서 사용자를 선택하게 하지 않습니다. 비활성 곡의 기록도 보존하여 반환하므로 집계는 현재 catalog의 곡 기준으로 계산합니다.
- PATCH /api/records: { chartId, lamp, memo?, scoreGrade? }. memo와 scoreGrade는 생략하면 기존 값을 보존하고, memo ''와 scoreGrade null은 값을 지웁니다. 카드의 빠른 램프 변경은 chartId와 lamp만 보내며 상세 폼은 전체 필드를 보냅니다. 인증·Zod·같은 출처 확인 후 자기 기록만 upsert. DB 반영 후 해당 사용자 서버 태그 만료, 클라이언트 관련 캐시 무효화.
- 기록 이력: 모든 기록 변경은 user_record_history에 추가하고 user_record는 차트별 최신 값을 담는 조회용 테이블입니다. PATCH /api/records는 lamp 또는 scoreGrade가 바뀔 때만 같은 트랜잭션에서 이력 한 줄(source 'manual')을 추가하고 user_record.source를 'manual'로 바꿉니다. ex_score·miss_count는 유지하며 메모만 바꾼 저장은 이력을 만들지 않습니다. 기록이 없는 차트는 NO_PLAY·null로 보고 비교합니다. 요청 본문의 exScore·missCount·source는 받지 않습니다.
- POST /api/import/records: rank-import v2 본문(strict, 최대 2MB)을 받아 세션 사용자의 기록으로 반영합니다. Origin이 사이트 출처면 channel 'file', EXTENSION_ORIGINS에 있으면 'extension'이고 그 밖에는 403 ORIGIN_NOT_ALLOWED입니다. 세션 없음 401 AUTH_REQUIRED, 스키마 불일치 400 INVALID_INPUT, style 1은 400 UNSUPPORTED_STYLE, 직전 가져오기 후 10초 안은 429 IMPORT_COOLDOWN, 본문 초과 413 PAYLOAD_TOO_LARGE입니다. 응답 { importId, channel, importedAt, receivedCount, matchedCount, changedCount, unmatched }. 본문의 사용자 식별 정보는 쓰지 않습니다.
- 가져오기 반영: 레벨 12이고 활성 catalog에 있는 차트만 대상으로 하며 같은 chartId가 중복되면 마지막 항목을 씁니다. NO_PLAY는 건너뛰고, lamp·scoreGrade·exScore·missCount 중 하나라도 다르면 가져온 값으로 바꾸고 이력에 한 줄(source 'eamusement', import_id)을 추가합니다. 메모는 보존합니다. eamusement_import 행 추가·user_record upsert·이력 추가·revision 증가는 하나의 트랜잭션이고, revision은 기록이 하나라도 바뀔 때만 올립니다. 반영 규칙은 entities/eamusement/eamusement-merge.ts의 순수 함수에 있습니다. 세부 계약은 docs/E-AMUSEMENT.md입니다.
- GET /api/import/status: 세션 사용자의 가장 최근 eamusement_import 행을 { latest: { importedAt, channel, receivedCount, matchedCount, changedCount, player: { djName, iidxId, danRank, djPoint, playCountSp, playCountDp }, notesRadar } | null }로 돌려줍니다. notesRadar는 여섯 축이 모두 비어 있으면 null입니다.
- GET /api/extension/session: 세션이 없으면 { user: null }, 있으면 { user: { id, name, handle } }를 200으로 돌려줍니다. 세션 토큰·이메일은 넣지 않고 CORS 헤더를 붙이지 않습니다.
- 프로필 응답의 eamusement: { djName, danRank, notesRadar, syncedAt } | null. 해당 사용자의 가장 최근 eamusement_import 행에서 채우며 IIDX ID는 넣지 않습니다.
- GET /api/catalog, GET /api/records. 모든 도메인 API 응답은 {success:true,data:DTO}, 오류는 {success:false,error:{code,message}}입니다. better-auth API는 라이브러리의 네이티브 응답 계약을 유지합니다. POST /api/cache/refresh는 인증 사용자 자신의 records 캐시만 즉시 만료합니다.
- GET/PATCH /api/preferences/display: 인증 사용자의 표시 설정 { userId, preferences: { versionDisplay: 'logo'|'title', logoOpacity: 0~100 정수 } }. PATCH는 strict 객체 검증·같은 출처 확인 후 자기 설정만 저장하고 해당 사용자 태그를 만료합니다. 비로그인 설정은 서버에 저장하지 않고 브라우저에 둡니다.
- POST /api/catalog/sync는 인증과 원본 요청 cooldown을 확인한 뒤 고정 allowlist 원본 URL만 fetch하여 동기화합니다. 사용자 URL 입력 불허. 동시 동기화 중복 방지, 전체 원자적 교체. DB 역할 admin만 수동 갱신 허용. GET은 CRON_SECRET 인증 전용이며 UTC 당일 중복 수집을 생략합니다.
- /api/auth/[...all]: better-auth. 이메일/비밀번호 회원가입·로그인으로 로컬 사용. UUID 생성. 런타임 secret은 사용자가 제공하며 에이전트는 .env에 접근하지 않습니다.
- 외부 로그인: better-auth 내장 github·naver 프로바이더. GITHUB_CLIENT_ID·GITHUB_SECRET_KEY, NAVER_CLIENT_ID·NAVER_SECRET_KEY가 둘 다 있는 프로바이더만 socialProviders에 넣고, 화면은 shared/server/social-providers.ts의 getEnabledSocialProviders()가 돌려준 목록만 버튼으로 그립니다. 계정 연결은 better-auth 기본 정책을 유지합니다. Naver 프로필에 이름과 닉네임이 모두 없으면 이메일 앞부분을 이름으로 씁니다.
- 외부 로그인의 다중 도메인: 프로바이더 콜백은 BETTER_AUTH_URL 출처 하나만 등록합니다. 다른 운영 출처에서 시작한 로그인은 better-auth oAuthProxy 플러그인(productionURL = BETTER_AUTH_URL)이 대표 출처의 콜백을 거쳐 시작한 출처의 /api/auth/callback/<provider>/oauth-proxy로 되돌려 그 출처에 세션을 만듭니다. 대표 출처에서 시작한 로그인은 플러그인을 거치지 않습니다.
- EXTENSION_ORIGINS: chrome-extension://<a~p 32자> 쉼표 목록. POST /api/import/records의 출처 검사에만 쓰고 better-auth trustedOrigins와 isTrustedOrigin에는 넣지 않습니다. 그 밖의 변경 API는 사이트 출처만 허용합니다.

## 캐시

- cacheComponents:true로 PPR과 use cache를 함께 활성화합니다. 정적 셸과 요청시간 세션/기록 영역을 Suspense로 분리합니다. 구버전 experimental.ppr/dynamic 옵션은 혼용하지 않습니다.
- 공개 catalog 'use cache' DB 조회: catalog 태그, 5분 재검증·1시간 만료. 원본 수집은 빌드·페이지·catalog GET에서 하지 않고 하루 1회 Cron과 관리자 수동 동기화 경로에서 수행합니다. catalog GET은 snapshot revision을 캐시 키에 포함합니다. 난이도표 페이지(/table)의 정적 셸과 그 값을 넘겨받는 서버 프리페치는 요청시간 값을 읽을 수 없어 revision 없이 catalog 태그 만료와 5분 재검증에 의존합니다.
- 표시 설정 'use cache' DB 조회: user UUID와 사용자별 revision이 키에 포함되고 user:<uuid>:display-preferences 태그로 분리합니다. 60초 재검증·5분 만료, 변경 직후 revalidateTag(tag,{expire:0}).
- records 'use cache' DB 조회: 함수 인자 user UUID가 키에 포함되고 user:<uuid>:records 태그로 분리합니다. 세션 인증은 캐시 밖에서 매 요청 검증합니다. 60초 재검증·5분 만료, 변경 직후 revalidateTag(tag,{expire:0}). 사용자별 revision을 함수 인자 키에 포함하여 저장 직후 이전 캐시를 재사용하지 않습니다.
- 개인 API HTTP 응답은 private,no-store입니다. 서버 내부의 UUID 캐시와 브라우저/CDN 응답 캐시는 다릅니다.
- 서버 QueryClient는 요청마다 새로 생성, queryOptions를 재사용하여 prefetchQuery. 서버는 DB 캐시 loader를 queryFn으로 제공하고 내부 API loopback 호출은 하지 않습니다.
- 클라이언트 key: catalog/list, checker/records/userUUID. auth 전환에서는 QueryClient.clear와 라우터 새로고침으로 이전 계정 데이터 제거. staleTime 기본 60초, catalog 5분. 클라이언트 mutate 완료 후 서버 태그 만료에 이어 invalidateQueries.
- 인증 정보·쿠키·헤더·세션 검증 결과를 공유 use cache 안에서 읽거나 저장하지 않습니다.

## 경계

- app/api는 Zod 검증·인증·오류 응답·캐시 만료를 담당합니다. entities 서버 파일은 도메인 수집/기록을 담당하고 DB는 shared/server/db에 둡니다.
- DTO 단일 출처: entities/catalog/catalog.dto.ts(CatalogSchema/ChartSchema), entities/checker/checker.dto.ts(CheckerSchema/RecordSchema/RecordInputSchema), entities/eamusement/eamusement.dto.ts(ImportInputSchema/ImportResultSchema/ImportStatusResponseSchema/ExtensionSessionSchema), 필요한 type은 z.infer로 유도합니다.
- 가져오기 테이블: user_record_history(추가만 하는 변경 이력, 인덱스 user_id·chart_id·id)는 shared/server/db/checker-schema.ts, eamusement_import(가져오기 1회 = 1행, 인덱스 user_id·id)는 shared/server/db/eamusement-schema.ts에 둡니다. 마이그레이션 0005가 기존 user_record 행을 source 'manual', recorded_at = updated_at으로 이력에 옮깁니다.
- 공개 데이터가 없을 때 샘플 곡이나 허위 통계를 넣지 않습니다. 빈 상태에서 동기화 버튼과 실제 상태를 제공합니다.
- 개인차는 CSS 클래스와 inline span의 색 상속을 해석합니다. 셀 전체 색만 보는 방식이나 전체 텍스트 단순 분할로 색을 잃는 방식은 불허합니다. 패턴 suffix의 마젠타와 개인차 빨강을 구분합니다.

## 역할과 표시

- user.role은 admin/user이며 기본 user입니다. Better Auth additionalFields에서 input:false로 클라이언트 역할 지정을 차단합니다. ADMIN_BOOTSTRAP_EMAILS는 서버 Secret이며 신규 계정 생성 훅과 기존 계정 seed에서 초기 관리자 역할을 지정합니다. 이후 API 인가는 이메일 대신 DB 역할을 확인합니다.
- 선택된 노멀/하드 기준 S+부터 F까지 랭크별 section을 만들고 각 section에서 지력·개인차를 나눕니다. 카드 안의 중복 랭크 및 정렬 필터를 제거하고 모바일 최소 3열을 유지합니다. 헤더·사이드바 필터 내부 padding은 12px, 콘텐츠 외곽은 0px입니다.

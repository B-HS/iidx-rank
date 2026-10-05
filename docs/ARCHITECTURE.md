# 구현 계약

## 데이터

- catalog 응답: { charts, source }. chart: { id, title, difficulty: 'H'|'A'|'L', version, normalRank, hardRank, normalPersonal, hardPersonal }. rank: 'F'|'E'|'D'|'C'|'B'|'B+'|'A'|'A+'|'S'|'S+'|null. version은 원본 버전 이름 문자열. id는 정규화된 제목+패턴 종류 기반 안정적 식별자(랭크/정렬과 독립).
- source: { updatedAt: string|null, fetchedAt: ISO string|null, chartCount: number, status: 'ready'|'empty', url: string }. 원본 게시일과 서버 수집시각을 구분합니다. 파싱 실패 시 정상 저장된 데이터를 유지하며 성공으로 표시하지 않습니다.
- checker 응답: { userId, records }. record: { chartId, lamp: 'NO_PLAY'|'FAILED'|'ASSIST'|'EASY'|'CLEAR'|'HARD'|'EX_HARD'|'FULL_COMBO', memo, updatedAt }. UUID는 서버 세션에서 얻습니다. 요청에서 사용자를 선택하게 하지 않습니다.
- PATCH /api/records: { chartId, lamp, memo }. 인증·Zod·같은 출처 확인 후 자기 기록만 upsert. DB 반영 후 해당 사용자 서버 태그 만료, 클라이언트 관련 캐시 무효화.
- GET /api/catalog, GET /api/records. 모든 도메인 API 응답은 {success:true,data:DTO}, 오류는 {success:false,error:{code,message}}입니다. better-auth API는 라이브러리의 네이티브 응답 계약을 유지합니다. POST /api/cache/refresh는 인증 사용자 자신의 records 캐시만 즉시 만료합니다.
- POST /api/catalog/sync는 인증과 원본 요청 cooldown을 확인한 뒤 고정 allowlist 원본 URL만 fetch하여 동기화합니다. 사용자 URL 입력 불허. 동시 동기화 중복 방지, 전체 원자적 교체. DB 역할 admin만 수동 갱신 허용. GET은 CRON_SECRET 인증 전용이며 UTC 당일 중복 수집을 생략합니다.
- /api/auth/[...all]: better-auth. 이메일/비밀번호 회원가입·로그인으로 로컬 사용. UUID 생성. 런타임 secret은 사용자가 제공하며 에이전트는 .env에 접근하지 않습니다.

## 캐시

- cacheComponents:true로 PPR과 use cache를 함께 활성화합니다. 정적 셸과 요청시간 세션/기록 영역을 Suspense로 분리합니다. 구버전 experimental.ppr/dynamic 옵션은 혼용하지 않습니다.
- 공개 catalog 'use cache' DB 조회: catalog 태그, 5분 재검증·1시간 만료. 원본 수집은 빌드·페이지·catalog GET에서 하지 않고 하루 1회 Cron과 관리자 수동 동기화 경로에서 수행합니다. snapshot revision을 캐시 키에 포함합니다.
- records 'use cache' DB 조회: 함수 인자 user UUID가 키에 포함되고 user:<uuid>:records 태그로 분리합니다. 세션 인증은 캐시 밖에서 매 요청 검증합니다. 60초 재검증·5분 만료, 변경 직후 revalidateTag(tag,{expire:0}). 사용자별 revision을 함수 인자 키에 포함하여 저장 직후 이전 캐시를 재사용하지 않습니다.
- 개인 API HTTP 응답은 private,no-store입니다. 서버 내부의 UUID 캐시와 브라우저/CDN 응답 캐시는 다릅니다.
- 서버 QueryClient는 요청마다 새로 생성, queryOptions를 재사용하여 prefetchQuery. 서버는 DB 캐시 loader를 queryFn으로 제공하고 내부 API loopback 호출은 하지 않습니다.
- 클라이언트 key: catalog/list, checker/records/userUUID. auth 전환에서는 QueryClient.clear와 라우터 새로고침으로 이전 계정 데이터 제거. staleTime 기본 60초, catalog 5분. 클라이언트 mutate 완료 후 서버 태그 만료에 이어 invalidateQueries.
- 인증 정보·쿠키·헤더·세션 검증 결과를 공유 use cache 안에서 읽거나 저장하지 않습니다.

## 경계

- app/api는 Zod 검증·인증·오류 응답·캐시 만료를 담당합니다. entities 서버 파일은 도메인 수집/기록을 담당하고 DB는 shared/server/db에 둡니다.
- DTO 단일 출처: entities/catalog/catalog.dto.ts(CatalogSchema/ChartSchema), entities/checker/checker.dto.ts(CheckerSchema/RecordSchema/RecordInputSchema), 필요한 type은 z.infer로 유도합니다.
- 공개 데이터가 없을 때 샘플 곡이나 허위 통계를 넣지 않습니다. 빈 상태에서 동기화 버튼과 실제 상태를 제공합니다.
- 개인차는 CSS 클래스와 inline span의 색 상속을 해석합니다. 셀 전체 색만 보는 방식이나 전체 텍스트 단순 분할로 색을 잃는 방식은 불허합니다. 패턴 suffix의 마젠타와 개인차 빨강을 구분합니다.

## 역할과 표시

- user.role은 admin/user이며 기본 user입니다. Better Auth additionalFields에서 input:false로 클라이언트 역할 지정을 차단합니다. ADMIN_BOOTSTRAP_EMAILS는 서버 Secret이며 신규 계정 생성 훅과 기존 계정 seed에서 초기 관리자 역할을 지정합니다. 이후 API 인가는 이메일 대신 DB 역할을 확인합니다.
- 선택된 노멀/하드 기준 S+부터 F까지 랭크별 section을 만들고 각 section에서 지력·개인차를 나눕니다. 카드 안의 중복 랭크 및 정렬 필터를 제거하고 모바일 최소 3열을 유지합니다. 헤더·사이드바 필터 내부 padding은 12px, 콘텐츠 외곽은 0px입니다.

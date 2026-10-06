# 2026-10-06 감사에서 보류한 항목

현재 상태: 코드 미변경, 결정 또는 재현 확인 대기

2026-10-06 전체 감사에서 확인했지만 이번 수정에 넣지 않은 항목입니다. 각 항목은 재현 조건, 보류 이유, 남은 위험, 실행이 필요해지는 시점을 적습니다. 수정한 항목은 docs/bug/2026-10-06-audit-fixes.md에 있습니다.

## 사용자 결정이 끝난 항목

결정 내용은 docs/acknowledge/2026-10-06-admin-bootstrap-and-lamp-cycle.md에 있습니다.

- [ ] 이메일 소유 검증 없는 관리자 초기 지정 — 결정: 현행 유지. 남은 확인은 목록 이메일의 가입 여부이며 사용자가 운영에서 수행합니다.
    - 대상: src/shared/server/auth.ts(emailAndPassword, 가입 훅), scripts/seed-admins.ts
    - 재현 조건: ADMIN_BOOTSTRAP_EMAILS에 아직 가입하지 않았거나 삭제된 계정의 이메일이 있을 때, 제3자가 그 이메일로 가입하면 즉시 admin 역할을 받습니다.
    - 보류 이유: 이메일 기반 초기 지정은 사용자가 명시적으로 허용한 방식입니다. 변경은 운영 정책 결정입니다.
    - 남은 위험: admin 권한 범위는 고정 원본 URL의 수동 수집 트리거(60초 쿨다운)입니다. 데이터 열람·타 사용자 수정 권한은 없습니다.
    - 선택지: 목록의 모든 이메일이 실제 소유자 계정으로 가입되어 있는지 운영에서 확인 / 가입 훅 자동 승격을 제거하고 seed만 사용자 UUID 기준으로 유지 / 이메일 검증 도입(메일 발송 수단 필요)
    - 실행 시점: 목록에 미가입 이메일을 추가하거나 관리자 권한 범위를 넓히기 전
- [x] 노멀 모드에서 상위 램프 카드를 클릭하면 EASY로 내려감 — 결정: 상위 램프는 클릭해도 유지하도록 수정
    - 대상: src/entities/checker/checker-lamp.ts(NORMAL_NEXT_LAMP의 HARD·EX_HARD·FULL_COMBO → EASY, HARD_NEXT_LAMP의 FULL_COMBO → HARD)
    - 재현 조건: HARD 이상으로 기록한 곡을 노멀 모드에서 한 번 클릭합니다.
    - 보류 이유: 기존 기록은 노멀 NO_PLAY→EASY→CLEAR→NO_PLAY 순환만 명시하고 상위 램프 처리는 정의하지 않았습니다. 의도 여부를 알 수 없습니다.
    - 남은 위험: 한 번의 클릭으로 상위 램프가 낮은 램프로 저장됩니다.
    - 실행 시점: 순환 규칙을 확정할 때

## 재현 확인 후 수정할 항목

- [ ] 세션 조회 실패를 로그아웃과 같게 취급
    - 대상: src/widgets/checker-workspace/checker-workspace.tsx(70~72행, 373~386행), src/widgets/app-shell/app-shell.tsx(AccountControl)
    - 재현 조건 1: 로그인 사용자의 최초 get-session 요청이 네트워크 오류나 5xx로 실패하면 목록이 스켈레톤에 머뭅니다. 탭 재포커스나 online 이벤트의 재조회가 성공하면 풀립니다.
    - 재현 조건 2: 로그아웃 성공 직후의 get-session 재조회가 실패하면 identity-transition gate가 닫힌 채 남습니다.
    - 보류 이유: 실패 상태의 표시(서버 초기값 유지 또는 재시도 안내)와 gate 종료 방식에 설계 결정이 필요하고, 401과 그 외 오류의 구분, 재시도 문구 3개 언어 추가가 따라옵니다. 네트워크 복구 시 자동 재조회로 풀리는 경로가 있습니다.
    - 남은 위험: 불안정한 네트워크에서 오류 안내 없이 대기 화면이 지속됩니다.
    - 실행 시점: 모바일 불안정 네트워크 신고가 있거나 오프라인 대응을 다룰 때
- [ ] 계정 전환 시 QueryClient.clear가 공개 catalog까지 지움
    - 대상: checker-workspace.tsx 380행
    - 재현 조건: clear와 router.refresh 응답 사이에 워크스페이스가 다시 렌더되면 useSuspenseQuery가 /api/catalog를 클라이언트에서 요청합니다. 실제 발생 여부는 미확인입니다.
    - 보류 이유: docs/CACHE.md의 clear 계약을 바꾸는 변경이며 발생 여부를 브라우저로 먼저 확인해야 합니다.
    - 실행 시점: 로그인 직후 로딩 폴백이나 오류 화면 신고가 있을 때
- [ ] 다른 탭에서 계정을 바꾼 직후 이 탭에서 빠른 램프 변경
    - 재현 조건: 탭 A에서 계정을 바꾸고, 탭 B가 포커스 재조회를 끝내기 전에 카드를 클릭합니다. 이전 계정 기록으로 계산한 램프가 새 계정에 저장됩니다.
    - 보류 이유: PATCH 응답에 userId가 없어 계약 변경이 필요하고 발생 창이 매우 짧습니다.
    - 실행 시점: 기록 API 계약을 다시 다룰 때
- [ ] GET /api/catalog가 로컬 file DB 빌드에서 정적으로 프리렌더됨
    - 관찰: 임시 SQLite로 bun run build 한 경로 표에서 /api/catalog가 Static(재검증 5분·만료 1시간)으로 표시됐습니다. catalog GET이 snapshot revision을 매 요청 읽는다는 계약과 다릅니다.
    - 보류 이유: Production은 Turso(네트워크 I/O)이고 기존 운영 검증에 동적 경로 기록이 있습니다. 이번 감사에서 Production 빌드의 경로 표는 확인하지 못했습니다. 정적이어도 catalog 태그 만료로 갱신됩니다.
    - 실행 시점: 다음 Production 빌드 로그의 경로 표에서 /api/catalog 표기를 확인합니다. Static이면 핸들러에 요청시간 경계가 필요합니다.
- [ ] 현지화된 404 화면에 도달할 경로가 없음
    - 대상: src/app/[locale]/not-found.tsx, src/proxy.ts
    - 관찰: 매칭되지 않는 URL은 [locale]/not-found.tsx가 아니라 Next 기본 404로 떨어집니다. [locale]/[...rest]/page.tsx에서 notFound()를 호출하는 방식을 시도했으나 Cache Components에서 정적 셸이 먼저 스트리밍되어 응답이 200(noindex 포함)이 되고 번역 문구가 서버 HTML에 없었습니다. 실제 404 상태가 사라지는 변경이라 되돌렸습니다.
    - 근거: 설치본 Next 문서 04-functions/not-found.md — Cache Components에서는 상태 코드를 바꿀 수 없으며 실제 404가 필요하면 proxy에서 먼저 검사합니다.
    - 선택지: 현재 유지(상태 404, 기본 영문 화면) / proxy에서 알려진 경로만 통과시키고 나머지를 현지화 404로 처리 / 200 소프트 404를 허용하고 catch-all 도입
- [ ] 로컬 환경의 DATABASE_URL 스킴
    - 관찰: 로컬 env 파일의 DATABASE_URL이 turso: 스킴이라 로컬 bun run build가 URL_SCHEME_NOT_SUPPORTED로 실패합니다. libSQL 클라이언트는 libsql:, wss:, ws:, https:, http:, file:만 지원합니다.
    - 보류 이유: 에이전트는 env 파일을 열람·수정하지 않습니다. 값 수정은 사용자가 직접 합니다.
- [ ] 익명 표시 설정 쿠키 만료 후 재기록 없음
    - 재현 조건: Safari ITP로 JS 설정 쿠키가 7일 뒤 만료되면 localStorage 값으로 화면은 복원되지만 쿠키를 다시 쓰지 않아, 설정을 다시 바꾸기 전까지 첫 화면이 전체 스켈레톤입니다.
    - 대상: src/entities/preferences/anonymous-preferences.client.ts

## 개선 후보

- 버전 필터 목록이 사전순이라 10th style이 1st style보다 앞에 옵니다(checker-workspace.tsx 95행). 연대순 정렬은 src/entities/catalog/catalog-series.ts의 순서를 재사용할 수 있습니다.
- 진행률 막대가 값을 보조기기에 전달하지 않습니다(src/shared/ui/progress.tsx가 value를 Root에 넘기지 않음, shadcn 원본과 동일).
- 수집 실패 원인이 서버 로그에 남지 않아 Cron 실패 시 503 외 진단 근거가 없습니다(src/app/api/catalog/sync/route.ts).
- 메시지 카탈로그에 코드가 참조하지 않는 키 47개가 3개 언어에 남아 있습니다(auth 7, checker 35, common 4, navigation 1). 표 레이아웃·정렬 필터 제거 이전의 문구입니다.
- 컨벤션 불일치: Props 타입명이 컴포넌트명Props가 아닌 Props, features/auth-dialog가 인증 네트워크 호출과 toast를 직접 수행하고 이름이 AuthDialogWidget, shared/lib/api-client.ts가 ko 메시지를 직접 import, 'Asia/Tokyo' 리터럴 3곳 중복, src/app/[locale]/page.tsx의 한 파일 3컴포넌트.
- ESLint 경고 3건(_generation, _revision 2곳)은 Next 캐시 키용 인자로 의도된 것이며 docs/quality-assurance/implementation.md에 기록된 기존 결정입니다.

## 커뮤니티 기능 구현 후 추가된 항목

- [ ] 원본 수집의 응답 본문 cancel 대기 — src/entities/catalog/catalog.storage.ts의 decodeBoundedResponse가 실패 경로에서 await response.body?.cancel()과 await reader.cancel()을 호출합니다. 파일 조회 API에서 같은 패턴이 Next의 fetch 본문 분기 때문에 끝나지 않는 것을 확인했습니다(docs/bug/2026-10-06-community-rollout.md). 수집은 10초 AbortSignal이 있어 무한 대기는 아닐 것으로 보이나 실행 확인은 하지 않았습니다. 실행 시점: 원본 서버가 오류나 과대 응답을 돌려줄 때 Cron이 503 대신 타임아웃으로 끝나는지 확인이 필요해질 때.
- [ ] /settings 하이드레이션 오류 1회 — 통합 검증 중 390px 폭에서 /u/<핸들> → /settings 이동 시 React 오류 #418이 한 번 발생했고 같은 이동과 새로고침에서 재현되지 않았습니다. 원인 미확인.
- [ ] 저장하지 않고 버린 업로드와 삭제된 글의 이미지 — 프로필 사진을 올린 뒤 저장하지 않거나 글을 삭제하면 uploaded_file 행과 R2 객체가 남습니다. 정리 작업이 없습니다.
- [ ] 로그인이 필요한 UI 감사 항목의 브라우저 확인 — 핸들 중복 시 필드 포커스, 상위 램프 안내 toast, 언어 전환 시 쿼리 유지, 포커스 링, 다크 테마 toast는 코드와 빌드로만 확인했습니다.
- [ ] 게시판·프로필의 없는 대상 응답 코드 — Cache Components에서는 스트리밍 시작 후 상태 코드를 바꿀 수 없어 없는 글·프로필이 200과 안내 화면으로 응답합니다. 실제 404가 필요하면 proxy에서 먼저 검사해야 합니다.

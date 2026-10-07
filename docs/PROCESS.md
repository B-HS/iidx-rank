# IIDX Rank 구현

현재 상태: 구현·화면·수집 정책·관리자 역할 검증 완료, GitHub main 및 Production 반영 완료

## 요청과 범위

- 기준 경로: /Users/hyunseokbyun/development/iidx-rank
- 디자인: 기존 docs:/DESIGN.md를 보존하고 docs/DESIGN.md에 복사하여 참조합니다. 문서의 시각 규칙을 적용하며, 그 안의 원본 제품·스택·외부 경로는 구현 명령으로 취급하지 않습니다.
- Next.js App Router와 /api Route Handlers, Bun, React Compiler, Tailwind + shadcn, better-auth, Drizzle + local SQLite(libSQL)를 사용합니다. 최초 구현은 로컬 SQLite였으며 이후 사용자 배포 지시에 따라 Production Turso와 Vercel을 적용했습니다.
- 최신 공개 Google Sheets HTML에서 노말/하드 랭크, 개인차, 패턴 종류, 수록 버전, 원본 갱신 정보를 수집합니다.
- 인증 사용자별 기록 저장·필터·달성률과 사용자 UUID로 분리한 서버 캐시 및 TanStack Query 캐시를 구현합니다.
- 사용자 최신 지시로 현재 구현에는 서브에이전트를 사용합니다. 새로 시작하는 서브에이전트는 gpt-6-luna, max effort로 명시합니다. 도구에는 Fast 전환 파라미터가 없으므로 Fast 설정 적용을 주장하지 않습니다. 메인 세션 모델을 변경하지 않습니다.
- e-amusement 연동은 docs에 향후 계획만 기록합니다.

## 체크리스트

- [x] 실제 프로젝트와 디자인·규칙 확인
- [x] 최신 Next 초기화와 공식 캐시·인증 문서 확인
- [x] HTML 파서·검증·원자적 SQLite 동기화 구현
- [x] 인증·사용자 기록·사용자별 서버 캐시·갱신 API 구현
- [x] 디자인 기반 shadcn 화면·TanStack Query·서버 프리페치 구현
- [x] 통합 빌드와 파서·인증 분리·갱신 동작의 위험별 검증
- [x] 우측 필터를 좌측에 통합하고 사이드바·콘텐츠 외곽 패딩 제거
- [x] 곡 목록을 모바일 최소 3열의 미니멀 카드 그리드로 변경
- [x] 변경 화면 빌드·데스크톱 2단·모바일 3열·필터 및 상세 기록 검증
- [x] 접힌 데스크톱 sidebar에서 통합 필터 숨김 수정·재검증
- [x] 실행 안내·캐시 계약·e-amusement 계획·검증 결과 기록

최신 사용자 지시가 디자인 문서의 기존 패딩·3단·표 레이아웃보다 우선합니다. 카드 상세에서 기록 편집을 유지합니다.

## 소유권

- bootstrap: 루트 설정·의존성·생성된 shared/ui와 utils
- cache_research: 읽기 전용 공식 문서 조사, 이후 검증
- backend: catalog HTML 파서·소스 저장·catalog 서버 조회·catalog API·수집 스크립트·파서 테스트
- private_backend: DB 공통·better-auth·개인 기록·개인 API·마이그레이션
- frontend: src/app의 layout/page/로딩/오류/UI 경로(API 제외), widgets/features, entities의 api/query/query-options, shared/providers/constants/messages, globals.css
- main: 계약·통합·문서·검증 판정. Git 저장소가 없으므로 자동 commit/push는 수행하지 않습니다.

기준: 사용자 AGENTS.md, ~/.codex/llm-rules 관련 전문, llm-rules-subagent-workflow/SKILL.md, docs/DESIGN.md.

## 완료 근거

- Next build 성공, 홈 Partial Prerender와 API 동적 경로 유지. 변경 UI ESLint 오류 0, 전체 대상 Prettier 통과.
- 데스크톱 CSS 1520px: 카드 6열, 좌측·콘텐츠 외곽 padding 0, 우측 패널 없음. 모바일 CSS 390px: 3열과 document width 390px 확인.
- 모바일 좌측 필터에서 Adularia 검색 후 1개 카드 표시, 상세 dialog에 곡명·랭크·개인차·램프·메모 확인.
- 실제 로컬 data/iidx.db로 localhost:3100 미리보기를 실행 중입니다. 운영 환경 미검증 항목은 docs/quality-assurance/implementation.md에 기록합니다.
- 접힌 desktop sidebar는 약48px이며 통합 필터가 숨겨집니다. 펼치면 필터가 다시 보이며 모바일 drawer에도 필터가 보입니다. 수정 후 build와 해당 파일 ESLint가 통과했습니다.

## GitHub·Vercel Production 배포

현재 상태: GitHub 연결·Production 배포·Secret 등록·DB migration·API 검증 완료

이번 작업은 사용자 선택으로 main이 직접 수행합니다. GitHub B-HS/iidx-rank에 commit/push하고 Vercel에 연결하며 Preview 배포는 끕니다. 사용자께서 .env 값을 Vercel에 등록하도록 명시적으로 요청하셨으므로, 이번 전송에 한하여 도구가 값을 처리하되 대화·로그·Git에는 값을 출력하거나 저장하지 않습니다.

- [x] 원격 Git 준비 및 배포 설정·DB 호환성 확인
- [x] 소스·문서·설정 선별 staging 후 commit/push
- [x] Vercel 프로젝트와 GitHub 저장소 연결, Production 전용 배포 설정
- [x] .env 변수를 Production sensitive 환경변수로 등록
- [x] 원격 DB migration·원본 수집·Production 배포 및 실제 응답 검증
- [x] 배포 URL·설정·검증 결과 기록

첫 Production 빌드는 shadcn/tailwind.css 의존성이 manifest에 없어 실패했습니다. package.json과 bun.lock에 shadcn을 추가하고 .env 및 기존 node_modules 없는 임시 복사본에서 frozen install과 build를 검증한 뒤 다시 배포합니다.

.env와 기존 node_modules 없는 임시 복사본에서 bun install --frozen-lockfile 성공(722 packages), bun run build 성공을 확인했습니다. 제한된 실행 환경에서 멈춘 빌드는 중단하고 승인된 정상 실행 환경에서 검증했습니다. Next.js 16.3.8의 Cache Components와 홈 Partial Prerender, 모든 API 동적 경로를 확인했습니다.

## 원본 수집 정책 수정

현재 상태: 일일 Cron·관리자 역할·랭크 화면 Production 반영 및 검증 완료

사용자 지시: 난이도표는 DB에서 조회하고, 원본 HTML은 하루에 한 번 또는 관리자 수동 갱신 때만 수집합니다. 이번 배포 작업의 후속 수정도 main이 직접 수행합니다.

- [x] 페이지·catalog GET에서 원본 수집 제거
- [x] Secret으로 보호하는 하루 1회 Vercel Cron과 DB 역할 관리자 수동 갱신·UI 게이트 구현
- [x] 원격 DB 동기화의 순차 upsert를 제한된 묶음으로 개선하고 원자성 유지
- [x] 수집 경로·권한·빌드 검증 후 main commit/push 및 Production 배포 확인
- [x] 수집 정책·배포 URL·검증 결과 기록

사용자가 이메일 기반 초기 지정을 명시적으로 허용하고 DB의 admin/user 역할을 요청했습니다. 계정 UUID 추가 확인은 요구하지 않습니다. 두 이메일은 Vercel Secret 초기 지정 설정으로만 등록하고, 권한 검사는 DB 역할을 사용합니다.

사용자 후속 디자인 지시: 헤더·필터 내부 padding 12px, 콘텐츠 외곽 padding 최소화, 선택된 노멀/하드 랭크별 section 및 지력/개인차 카드 배치, 정렬 필터 제거를 같은 작업에 반영합니다.

- [x] 랭크별 section/card·정렬 필터 제거·내부 padding 수정 및 모바일 3열 검증

로컬 검증: 666개 묶음 저장, 비활성 곡 기록 보존, 조회 중 원본 fetch 없음, 수집 실패 시 스냅샷 보존. 역할 위조 가입은 user, 역할 변경 요청은 400, 일반 사용자 수집은 403, 관리자 수집은 200, Cron Secret 없거나 틀리면 401. 새 설치 build·typecheck 성공, 변경 ESLint 오류 0(캐시 키 인자 경고 1). 데스크톱 1280px·모바일 390px 가로 넘침 없음, 모바일 3열, 헤더·필터 내부 12px, 콘텐츠 외곽 0px. 冥의 노멀 A → 하드 S+ 섹션 이동 확인.

Production https://iidx-rank.vercel.app: 7f7166c 자동 배포 READY, cloud build에서 db:migrate → db:seed-admins → Next build 성공. catalog 200/666개, 반복 조회 fetchedAt 유지, 개인 기록 GET/PATCH와 원본 수동 POST 및 Secret 없는 Cron GET 모두 401. Vercel Cron native 실행 2026-10-05T10:22:45.819Z, 해당 GET 200 필터 로그 확인. 운영 모바일 CSS 390px에서 3열·document width 390px. 다음 예약 실행 시각의 실제 로그 관찰은 운영 검증 부채로 구분했습니다.

## Vercel Web Analytics·Speed Insights

현재 상태: 설치·전역 적용·build·Production 배포·두 수집 스크립트 200 확인 완료

- [x] 현재 레이아웃·의존성과 공식 문서 확인
- [x] 요청된 두 패키지 설치와 root layout 전역 적용
- [x] 프로젝트 수집 기능 활성 상태 확인 및 최소 빌드 검증
- [x] 검증 결과 기록·선별 commit/push·Production 배포와 수집 스크립트 확인

사용자가 이번 작업은 서브에이전트 없이 직접 수행하도록 선택했습니다. Next 전용 컴포넌트를 공통 layout에 적용하고 기본 방문·성능 수집만 사용합니다.

## 사이드바 하단 버튼 정렬

현재 상태: 하단 정렬·빌드·반응형·Production 화면 검증 및 GitHub 반영 완료

- [x] 화면과 실제 footer 버튼 스타일 확인
- [x] 테마·로그인·계정·로딩 상태의 공통 정렬 적용
- [x] 빌드 및 펼침·접힘·모바일 표시 확인
- [x] 결과 기록·선별 commit/push·Production 배포 확인

이번 작업은 사용자 선택으로 main이 직접 수행합니다. 각 버튼의 아이콘·문구 묶음을 같은 기준으로 중앙 정렬하고 기존 최소 외곽 padding을 유지합니다.

## 스켈레톤과 접힌 사이드바 보완

현재 상태: 스켈레톤·개인 기록 pending·접힘 정렬 및 운영 검증 완료

- [x] 로딩 경계·쿼리 상태·접힘 버튼 실제 코드와 공식 문서 확인
- [x] 필터·헤더·랭크 카드 구조에 맞는 초기 스켈레톤 적용
- [x] 계정 전환·개인 기록 초기 조회 스켈레톤과 기존 캐시 보존 적용
- [x] 접힌 메뉴 전체 너비·하단 아이콘 세로 배치 적용
- [x] 빌드 및 초기·기록 pending·펼침/접힘·모바일 상태 검증
- [x] 결과 기록·선별 commit/push·Production 배포 확인

사용자가 main 직접 수행을 선택했습니다. 후속 지시로 접힌 메뉴 오른쪽 잔여 공간 제거와 하단 세로 아이콘 배치를 같은 작업에 포함합니다. 일반 조회는 DB만 사용하고 캐시가 있는 백그라운드 재조회에서는 화면을 스켈레톤으로 되돌리지 않습니다.

## 로고·게이지 터치·DJ 랭크·격자 보완

현재 상태: 구현·빌드·API 33항목·화면·Production·GitHub 반영 완료, 지정 이메일은 운영/로컬 DB 0건 확인

- [x] 공식 색상·로고 버전 매핑·격자 원인·계정 생성 경로 확인
- [x] DJ 랭크·사용자 표시 설정 스키마와 migration·인증 API·UUID/revision 캐시 구현
- [x] 로고/시리즈명·불투명도 표시 설정과 서버 저장·초기 prefetch 구현
- [x] EASY→CLEAR→미플레이 및 HARD→EX HARD→미플레이 터치·길게 누름 모달·DJ 랭크 구현
- [x] 난이도 테두리·5px 점멸 램프·빈칸 포함 반응형 격자·화면 문구 수정
- [x] 가입을 막는 대상 계정 확인 및 사용자 지정 범위의 삭제·재가입 가능 여부 검증
- [x] 임시 SQLite API/사용자 분리·동작·설정 지속·반응형·빌드 검증
- [x] 결과 기록·선별 commit/push·Production migration 및 운영 화면 확인

이번 작업은 main이 직접 수행합니다. 하드 순환은 사용자가 HARD→EX HARD→미플레이로 확정했습니다. 사용자 public/iidx-logo 파일을 사용하고 신뢰할 수 없는 버전은 제목으로 fallback합니다. 일반 조회는 DB만 사용합니다. 계정 생성 시드는 없으며, 사용자께서 hs@gumyo.net의 계정과 연결 기록 삭제를 명시적으로 승인했습니다. 해당 이메일만 삭제하고 다른 계정은 보존합니다.

## 글자 배경 제거·난이도 왼쪽 테두리

현재 상태: 글자 배경 제거·왼쪽 2px 난이도 테두리·검증·GitHub·Production 반영 완료

- [x] 카드 글자 배경과 난이도/램프/격자 구조 확인
- [x] 곡명·시리즈명·DJ 랭크 배경 제거 및 난이도 왼쪽 2px 적용
- [x] 빌드·데스크톱/모바일 격자·램프 위치 검증
- [x] 결과 기록·선별 commit/push·Production 확인

사용자가 main 직접 수행을 선택했습니다. 기존 5px 램프 및 중립색 격자 경계는 유지합니다. 기준: AGENTS.md와 llm-rules 관련 전문 및 Next 로컬 CSS 가이드.


## 카드 밀도·접기·필터와 설정 모달

현재 상태: 구현·검증·GitHub·Production 반영 완료 (6/6)

- [x] 기존 카드·사이드바·설정 저장 구조와 공식 Collapsible 문서 확인
- [x] 로고 카드 두 줄 높이·기본 불투명도 10% 및 기존 설정 보존 migration 적용
- [x] 랭크 간 gap 제거·shadcn Collapsible 헤더 적용
- [x] 사용자 메뉴 설정 모달·헤더 곡 필터 모달·사이드바 및 스켈레톤 정리
- [x] 빌드·migration 보존·모달/접기/반응형 및 설정 저장 검증
- [x] 결과 기록·선별 commit/push·Production 반영 확인

사용자가 workflow 없이 main 직접 수행을 명시했습니다. 기존 저장 설정은 보존하고 미설정 계정과 비로그인 기본값만 10%로 변경합니다. 램프·DJ 랭크·UUID 캐시 계약은 유지합니다. 기준: AGENTS.md, llm-rules 관련 전문, Next 로컬 가이드, Radix Collapsible 및 shadcn 공식 registry.


## 가입 오류·KO/JP/EN·비로그인 설정·로딩 크기

현재 상태: 구현·검증·GitHub·Production 및 두 운영 주소 확인 완료 (7/7)

- [x] 가입 오류 코드·운영 응답과 초기 로딩/최종 레이아웃 차이 재현
- [x] 가입 오류 원인 수정·검증된 오류 코드별 안내 및 두 운영 도메인 인증 확인
- [x] KO/JP/EN i18n·언어 선택/저장·UI/폼/접근성/날짜/알림 번역 적용
- [x] 비로그인 표시 설정 저장/복원·계정 설정 분리 및 초기 표시 동기화
- [x] 로고/시리즈명 공통 크기 계약·실제 랭크 수/열 수/헤더/사이드바와 일치하는 로딩 적용
- [x] 빌드·가입/오류·언어·설정 지속·로딩 전후 모바일/데스크톱 크기·CLS 검증
- [x] 결과 기록·선별 commit/push·Production 배포/운영 확인

사용자가 서브에이전트 없이 직접 진행을 명시했습니다. .env/키 파일을 읽거나 쓰지 않습니다. 개인 UUID 캐시·DB 저장·수집 주기는 유지합니다. 일본어 표시 이름 JP의 실제 표준 locale은 ja입니다. 기준: AGENTS.md와 llm-rules 관련 전문, Next 로컬 Cache Components/authentication/i18n 가이드 및 선택한 i18n·Better Auth 공식 문서.


## 모바일 Safari 문서 스크롤·랭크 sticky

현재 상태: 구현·검증·GitHub·Production 화면 확인 완료 (4/4), 실제 iPhone 상태 표시줄 탭은 미검증

- [x] 실제 스크롤 주체·overflow 조상과 공식 CSS/Next 문서 확인
- [x] 모바일 문서 스크롤 복원 및 콘텐츠 헤더/랭크 헤더 sticky·동일 스켈레톤 구조 적용
- [x] 모바일/데스크톱 스크롤·랭크 교체·접기·모달 복원·격자·빌드 검증
- [x] 결과·실기기 검증 한계 기록 및 선별 commit/push·Production 확인

사용자가 서브에이전트 없이 직접 진행을 선택했습니다. 모바일은 문서 스크롤, 데스크톱은 기존 내부 목록 스크롤을 유지하며 CSS sticky를 사용합니다. 모달과 사이드바의 Radix 스크롤 잠금은 유지합니다. 기준: AGENTS.md, llm-rules 관련 전문, llm-rules-process/verify/save-docs, Next 로컬 스타일 가이드, MDN position 문서.


## Sticky 레이어·하단 여백·일일 갱신 확인

현재 상태: 빌드·화면·GitHub·Production 확인 및 자동 갱신 활성 확인 완료 (4/4)

- [x] 카드/헤더 레이어 재현 및 운영 Cron·공식 주기 확인
- [x] 랭크 헤더 레이어 상향·목록 하단 9rem·공통 스켈레톤 적용
- [x] 빌드·모바일/데스크톱 겹침·모달·하단 여백 검증
- [x] 결과 기록·선별 commit/push·Production 확인

사용자가 main 직접 수행을 선택했습니다. 모바일 문서 스크롤과 데스크톱 목록 스크롤을 보존합니다. 일반 조회는 DB에서만 읽고 기존 관리자/일일 원본 갱신 경로는 유지합니다. 기준: AGENTS.md, llm-rules 전문 및 process/verify/save-docs, Next 설치 CSS 가이드, Vercel Cron 공식 문서.


## 버그·수정 필요 지점 감사 및 수정

현재 상태: 수정·검증·기록·GitHub 반영 완료 (5/5), 로컬 기존 환경의 build와 브라우저 재현은 미검증

- [x] a. 영역별 읽기 전용 감사 — 서버·데이터·캐시·인증(Opus), 클라이언트 상태·UI(Opus), 기준 검증 typecheck·lint·test·메시지 키 정합(Sonnet) 병렬
- [x] b. main이 실제 파일로 각 발견을 재확인하고 수정 대상·보류 대상 분류
- [x] c. 파일 소유권이 겹치지 않는 단위로 수정 위임 및 통합
    - 작업자 A(Opus): 빠른 램프 변경의 메모·DJ 랭크 덮어쓰기, 비로그인 세션 재조회 시 화면 초기화, 테마 아이콘 하이드레이션 불일치, 슬라이더 키보드 포커스 유실, 기록률 분자의 비활성 곡 포함 — checker.dto.ts, checker.server.ts, checker dto 테스트, checker-workspace.tsx, app-shell.tsx, display-settings.tsx, preferences.query.ts
    - 작업자 B(Sonnet): 오류 화면 retry, 모바일 로딩 스켈레톤 높이, 카드 키보드 클릭 억제 잔존, 수집 스크립트 DB 연결 종료, typecheck 스크립트의 타입 생성 선행, 현지화 404 경로 — error.tsx, checker-loading.tsx, chart-card.tsx, scripts/sync-source.ts, package.json, [locale]/[...rest]/page.tsx
    - main: docs/ARCHITECTURE.md·docs/CACHE.md 계약 갱신, docs/bug·docs/quality-assurance 기록
- [x] d. 변경 위험에 비례한 최소 검증 — typecheck 0, lint 오류 0·기존 경고 3, test 17 pass, 임시 SQLite의 upsertRecord 13개 단언 일치, 임시 SQLite 지정 build 0
- [x] e. 결과 기록(docs/bug 등)·논리 단위 선별 commit/push — 수정 10개 커밋과 문서 커밋

현지화 404용 [locale]/[...rest]/page.tsx는 Cache Components에서 200 소프트 404가 되어 제거하고 보류 항목으로 옮겼습니다. 로컬 env의 DATABASE_URL이 turso: 스킴이라 기존 환경의 build는 이번 변경과 무관하게 실패했습니다. 수정 내역은 docs/bug/2026-10-06-audit-fixes.md, 보류·결정 필요 항목은 docs/quality-assurance/2026-10-06-audit-deferred.md, 진행 이력은 docs/history/2026-10-06-audit-and-fixes.md에 있습니다.

사용자가 workflow 사용과 Fable 미사용을 명시했습니다. main은 Opus, 하위는 난이도에 따라 Opus(의미적 감사·까다로운 수정)와 Sonnet(범위가 분명한 수정·기계 검증)으로 배정합니다. 하위 에이전트는 Git과 .env에 접근하지 않습니다. 확인된 결함만 최소 변경으로 고치고 요청 밖 리팩토링은 하지 않습니다. 기준: AGENTS.md, llm-rules 전문, docs/ARCHITECTURE.md, docs/CACHE.md, 설치본 Next 문서.


## 감사 후속 결정 반영 — 관리자 초기 지정 유지·상위 램프 보호

현재 상태: 수정·검증·기록·GitHub 반영 완료 (4/4), 브라우저 재현과 목록 이메일의 가입 여부 확인은 미수행

- [x] a. 결정 기록 — docs/acknowledge에 관리자 초기 지정 유지(코드 변경 없음, 가입 여부는 사용자가 운영에서 확인)와 상위 램프 보호 규칙 기록, 보류 문서 갱신
- [x] b. 램프 순환 수정(Sonnet) — checker-lamp.ts의 상위 램프 전이를 자기 자신으로, checker-workspace.tsx는 램프가 바뀌지 않으면 저장 요청 생략, 순환 테스트 추가
- [x] c. 최소 검증 — 관련 테스트·typecheck·수정 파일 lint — checker 테스트 9 pass, tsc 오류 0, eslint 오류·경고 0, prettier 통과
- [x] d. 선별 commit/push

사용자 결정(2026-10-06): 관리자 초기 지정은 A(목록 이메일의 가입 여부 확인만, 코드 변경 없음), 노멀 모드 램프 순환은 B(상위 램프는 클릭해도 내려가지 않게 변경). 같은 작업의 후속 단계이므로 workflow 선택을 유지합니다. 설계된 순환의 되돌림(노멀 CLEAR→NO_PLAY, 하드 EX_HARD→NO_PLAY)은 유지합니다.


## 커뮤니티 기능·DP·UI 고도화

현재 상태: 구현·검증·기록·GitHub 반영 완료 (12/12, DP는 사용자 결정으로 제외). UI/UX 수정분의 시각 항목과 로컬 기존 환경 빌드는 미검증

- [x] 0. 결정 기록·기반 조사 — DP 원본 시트, tiptap·R2 공식 문서, 현재 셸·라우트 구조
- [x] 1. 설계 계약 문서화 — 라우트·DB 스키마·API·캐시·파일 소유권
- [x] 2. 기반 — 홈 `/`·난이도표 `/table` 라우트 재구성, 공용 셸 내비게이션, 스키마·마이그레이션, R2 파일 저장, 필요한 shadcn 컴포넌트
- [x] 3. 곡 램프 깜빡임 속도 2배 (요청 5)
- [x] 4. DESIGN.md 통합과 docs:/ 폴더 삭제 (요청 9)
- [x] 5. 사용자 페이지(탭·프로필 사진·닉네임·팔로우·플레이 보면 수·소개)·프로필 설정·공개/비공개 (요청 1·2)
- [x] 6. 사이드바 홈 메뉴와 대시보드 빈 상태 (요청 3)
- [x] 7. 사이드바 최근 갱신 사용자 목록 — 기록 수정 순, 공개 프로필만 (요청 4)
- [x] 8. DP 난이도표 — 원본 스프레드시트에 DP 표가 없어 사용자 결정으로 이번 범위에서 제외 (요청 6)
- [x] 9. 게시판 — tiptap 에디터, 글·댓글·본문 이미지, 공지 관리자 CRUD, 페이징 (요청 7)
- [x] 10. 게시판 사용자 이름 메뉴 — 프로필 이동(공개 시)·차단 (요청 8)
- [x] 11. UI/UX 감사와 적용 — 판단이 분명한 일관성·접근성 항목만 적용, 큰 디자인 변경은 목록 보고 (요청 9)
- [x] 12. 통합 검증·기록·기능 단위 commit/push

사용자 결정(2026-10-06): workflow 사용(main Opus, 하위 Opus/Sonnet, Fable 미사용). 기능 단위로 검증 후 main 푸시. 사용자 주소는 고유 핸들 /u/<핸들>. 프로필 사진과 게시판 이미지는 반드시 Cloudflare R2에 저장하며 이미지 기능을 빼지 않습니다(env 키 R2_ACCESS_KEY, R2_SECRET_KEY, R2_URL은 사용자가 등록, 에이전트는 값 미열람). 프로필 공개 기본값은 비공개. 게시판은 글·댓글·본문 이미지. UI/UX는 판단이 분명한 항목만 적용. 가정: 홈은 /, 난이도표는 /table, 비공개 프로필은 본인만 열람, 차단은 글·댓글 숨김, 게시판 읽기는 공개·쓰기는 로그인, 공지는 상단 고정·관리자 전용. 기준: AGENTS.md, llm-rules 전문, docs/ARCHITECTURE.md, docs/CACHE.md, docs/DESIGN.md, 설치본 Next 문서, tiptap·Cloudflare R2 공식 문서.


## UI/UX 결정 16건 반영·SEO·JSON-LD

현재 상태: 구현·검증·기록·GitHub 반영 완료 (6/6). 로그인이 필요한 조작의 브라우저 확인과 대표 주소(https://iidx.hyns.dev)의 사용자 확인이 남음

- [x] a. 결정 기록과 사전 조사 — bblog의 virtual-scroll, 운영 도메인, 현재 셸·버튼·전역 스타일
- [x] b. 1차 구현(병렬) — 셸(비로그인 진입 경로·사이드바 구조·셸 안 오류 화면·최근 사용자 목록), 난이도표(모션 감소 램프 구분·터치 대상·필터 상태와 게이지 전환·길게 누르기 안내), 게시판(종류 표시·행 전체 클릭·툴바 키보드 이동·이미지 alt·본문 오류 연결·제목 위계·댓글 페이지 주소·미저장 경고·toast 정책), 프로필(저장 버튼 위치·미저장 경고·탭 주소·toast 정책)
- [x] c. 2차 구현(병렬) — SEO·JSON-LD·동적 문서 제목·현지화 404, virtual-scroll 적용, 용어·어투 통일과 toast 모양
- [x] d. 검증 — typecheck·lint·test·build, 메타데이터·JSON-LD·robots·sitemap·404 응답 확인
- [x] e. main의 diff 확인과 브라우저 점검
- [x] f. 기록·선별 commit/push

사용자 결정(2026-10-06): 감사 문서 "보고만" 16건 중 1 추천안(모션 감소 시 두 색 정적 표시), 2 유지(일본 시간 고정), 3 bblog의 virtual-scroll을 가져와 네이티브 스크롤바를 숨긴 채 적용, 4~7·9·11 추천안, 8 적당한 위치에 필터 상태 표시와 게이지 전환, 10 필요한 곳에 주소 반영, 12 동적 문서 제목과 전체 페이지의 SEO·JSON-LD, 13 용어·어투 전부 정정, 14 toast 정책 통일, 15 최근 사용자 목록 수정, 16 길게 누르기 안내를 터치 기기에서 보이게. 진행 방식은 Agent 도구의 개별 서브에이전트 대신 Workflow 도구로 오케스트레이션합니다(main Opus, 단계별 Opus/Sonnet과 effort 지정, Fable 미사용). .env.example의 R2 키 3줄은 사용자가 추가했습니다. 기준: AGENTS.md, llm-rules 전문, docs/COMMUNITY.md, docs/quality-assurance/2026-10-06-ui-ux-audit.md, 설치본 Next 문서.


## 사용자 목록 페이지 분리와 사이드바 메뉴 순서

현재 상태: 구현·검증·기록·GitHub 반영 완료 (4/4)

- [x] a. 사용자 목록 조회를 페이지 단위로 변경 — entities/profile(dto·storage·server·api·query), GET /api/users?page=, 쿼리 키, 공용 페이지네이션 헬퍼
- [x] b. /users 페이지 — 목록 위젯·스켈레톤·페이징, 메타데이터·JSON-LD·sitemap
- [x] c. 사이드바 — 최근 갱신 사용자 목록 제거, 메뉴 순서 홈·사용자·게시판·난이도표(맨 아래, 그 밑에 난이도표 패널)
- [x] d. 검증·기록·commit/push

사용자 지적(2026-10-06): 최근 갱신 사용자는 사이드바 목록이 아니라 별도 페이지로 보여 주는 것이 맞고, 난이도표 메뉴는 누르면 필터·패널이 아래에 펼쳐지므로 항상 메뉴의 맨 아래에 둡니다. 직전 작업의 후속 수정이며 범위가 작아 main이 직접 수행합니다(서브에이전트 미사용).

검증: typecheck 통과, lint 오류 0(기존 경고 4), 테스트 141 pass, 임시 SQLite 빌드 통과(/users 부분 프리렌더, /api/users 동적). 로컬 서버에서 /users·/users?page=2·/ja/users 200과 제목, canonical, GET /api/users?page=1 응답, page=0은 400, 이전 /api/users/recent는 404, sitemap에 /users 3개 로케일. 브라우저 1280폭에서 메뉴 순서(홈·사용자·게시판·난이도표)와 난이도표 패널 위치, 사용자 목록 화면, 콘솔 오류 없음(로컬의 /_vercel 스크립트 404 제외)을 확인했습니다.


## 외부 로그인·e-amusement 가져오기·익스텐션 연동

현재 상태: 구현·검증·기록·GitHub·Production 반영 완료 (9/9). 실제 OAuth 왕복과 익스텐션 실기 동작은 미검증

- [x] 0. 두 저장소 조사, 결정 4건 확인, 계약 문서(docs/E-AMUSEMENT.md)와 결정 기록 작성
- [x] 1. 사전 조사(병렬) — better-auth 1.7.7 외부 로그인 설정과 다중 도메인 콜백(Sonnet), Chrome 익스텐션의 쿠키 전송·chrome.i18n(Sonnet), 파서 검증 리뷰(Opus, 읽기 전용)
- [x] 2. iidx-rank 서버(Opus) — 환경변수, GitHub·Naver 프로바이더, 기록 이력·가져오기 스키마와 마이그레이션, 가져오기 도메인, `/api/extension/session`·`/api/import/records`·`/api/import/status`, 수동 저장의 이력 기록, 프로필의 플레이어 정보
- [x] 3. iidx-rank 화면(Sonnet) — 로그인 대화상자의 외부 로그인 버튼, 설정의 e-amusement 가져오기(파일 업로드·최근 동기화·플레이어 정보), 프로필의 플레이어 정보, 차트 상세의 EX SCORE·MISS COUNT, ko·ja·en 메시지
- [x] 4. 파서 코어(Opus) — 검증 리뷰 지적 수정, rank-import v2, iidx-rank 세션 확인과 자동 반영, 진행 메시지의 키화, 빌드 시 RANK_ORIGIN 주입
- [x] 5. 파서 화면(Sonnet) — popup 분리(1파일 1컴포넌트, useCallback 제거), iidx-rank 계정·반영 결과 카드, chrome.i18n ko·ja·en, UI/UX 점검, 문서 갱신
- [x] 6. 교차 리뷰(Opus, 읽기 전용) — 두 저장소의 계약 일치와 가져오기 경로의 보안
- [x] 7. main의 diff 확인·리뷰 지적 반영·최소 검증(임시 SQLite에서 마이그레이션·typecheck·lint·test·build, 파서 typecheck·test·build)
- [x] 8. 기록·논리 단위 commit과 push. iidx-rank는 사용자 확인(2026-10-07) 뒤 push

사용자 결정(2026-10-07): 익스텐션은 브라우저의 iidx-rank 세션 사용, 네이버 키 이름은 NAVER_CLIENT_ID, 기록은 변경마다 이력에 insert하고 조회는 최신 값, 저장 범위는 기록 확장과 플레이어 정보. 카카오 로그인은 TODO. Workflow 도구로 진행하고 Fable·서브에이전트·general-purpose 에이전트는 쓰지 않습니다(main Opus, 단계별 Opus·Sonnet). 로컬 env의 DATABASE_URL이 운영 DB를 가리킬 수 있으므로 DB에 닿는 모든 명령은 `DATABASE_URL=file:./data/verify-import.db`를 앞에 붙여 임시 SQLite에서만 실행합니다. 하위 작업은 Git과 .env에 접근하지 않습니다. 기준: AGENTS.md, llm-rules 전문, docs/E-AMUSEMENT.md, docs/acknowledge/2026-10-07-eamusement-import-oauth.md, docs/ARCHITECTURE.md, docs/CACHE.md, docs/DESIGN.md, 설치본 Next 문서, better-auth·Chrome Extensions 공식 문서.

결과: Workflow 1회(에이전트 8개)와 main의 리뷰 지적 반영으로 끝냈습니다. 교차 리뷰는 높음 0·중간 2·낮음 10건이었고, 오래된 데이터의 덮어쓰기 방지, null 값 유지, 플레이어 정보 조회 기준, OAuth 토큰 암호화, 계약 문서 정정을 반영했습니다. 검증은 임시 SQLite에서 마이그레이션·backfill·typecheck 0·test 181 pass·lint 오류 0·build 성공·통합 32개 단언·로컬 서버 HTTP 14개 경로·설정 화면 표시입니다. `.env.example`은 권한 설정으로 에이전트가 읽거나 쓸 수 없어 사용자가 직접 수정한 상태 그대로 두었습니다(커밋하지 않음). 이력은 docs/history/2026-10-07-oauth-eamusement-import.md, 남은 확인은 docs/quality-assurance/2026-10-07-oauth-eamusement-import.md에 있습니다.

Production(https://iidx.hyns.dev): push 후 GET /api/extension/session 200 `user: null`, GET /api/import/status 401, GET /api/catalog 200을 확인했습니다. 새 라우트가 응답하므로 빌드 단계의 마이그레이션 0005와 배포가 끝난 상태입니다.

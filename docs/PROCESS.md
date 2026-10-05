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

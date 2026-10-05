# 2026-10-06 전체 감사에서 수정한 결함

서버·데이터 계층과 클라이언트 계층을 나눠 읽기 전용으로 감사한 뒤, 실제 파일로 재확인한 결함만 수정했습니다. 보류한 항목은 docs/quality-assurance/2026-10-06-audit-deferred.md에 있습니다.

## 기록 저장

### 빠른 램프 변경이 메모와 DJ 랭크를 덮어씀

- 대상: src/entities/checker/checker.dto.ts, checker.server.ts, src/widgets/checker-workspace/checker-workspace.tsx
- 증상: 다른 탭이나 기기에서 메모·DJ 랭크를 저장한 뒤, 기록 캐시가 갱신되지 않은 화면에서 카드를 클릭하면 오류 없이 메모가 빈 값으로, DJ 랭크가 null로 바뀝니다.
- 원인: PATCH /api/records에 memo의 "생략 = 보존" 의미가 없어 서버가 항상 memo를 덮어썼고, 보존을 클라이언트 캐시 값 재전송에 의존했습니다.
- 수정: 입력 스키마의 memo를 기본값 없는 optional로 바꾸고, 충돌 update는 memo와 scoreGrade를 입력에 제공된 경우에만 갱신합니다. 빠른 램프 변경은 chartId와 lamp만 보냅니다. 상세 폼은 전체 필드를 보내는 기존 동작을 유지합니다.

### 기록률 분자에 비활성 곡의 기록이 포함됨

- 대상: checker-workspace.tsx
- 증상: 기록한 곡이 원본에서 제목 변경·삭제로 비활성화되면 "N / 전체"와 비율이 실제 표시 곡보다 크게 나옵니다.
- 원인: 분자는 사용자 기록 전체, 분모는 활성 catalog 곡 수였습니다.
- 수정: 분자를 현재 catalog 곡 기준으로 셉니다.

## 세션·화면 상태

### 비로그인 사용자가 탭으로 돌아오면 로그인 폼과 목록이 초기화됨

- 대상: src/widgets/app-shell/app-shell.tsx, checker-workspace.tsx
- 증상: 가입 폼 입력 중 다른 탭이나 앱에 다녀오면 다이얼로그가 로그인 모드의 빈 폼으로 다시 열립니다. 목록의 모든 카드가 잠깐 비활성·스켈레톤이 되고 열려 있던 상세 창의 입력이 사라집니다.
- 원인: better-auth 클라이언트는 세션 data가 null인 동안 visibilitychange·online 재조회마다 isPending을 true로 올립니다(node_modules/better-auth/dist/client/session-atom.mjs). 이 값을 최초 로딩으로만 가정해 계정 메뉴가 조기 반환하며 다이얼로그를 언마운트했고, 기록 대기 판정에도 그대로 썼습니다.
- 수정: 계정 메뉴는 스켈레톤과 드롭다운만 분기하고 인증 다이얼로그를 항상 같은 위치에 렌더합니다. 기록 대기 판정은 서버가 로그인 사용자로 내려준 경우에만 세션 대기를 반영합니다. 로그인 사용자의 판정은 이전과 같습니다.

### 테마 아이콘 하이드레이션 불일치

- 대상: app-shell.tsx(ThemeControl)
- 증상: 다크 테마를 저장한 사용자가 새로고침하면 서버 HTML의 Moon과 클라이언트 첫 렌더의 Sun이 달라 하이드레이션 오류가 납니다.
- 원인: next-themes의 resolvedTheme은 서버에서 undefined이고 클라이언트 하이드레이션 렌더에서는 저장값을 읽습니다.
- 수정: 두 아이콘을 모두 렌더하고 dark variant CSS로 전환합니다. resolvedTheme은 클릭 핸들러에서만 읽습니다.

### 오류 화면의 다시 시도가 서버 오류를 복구하지 못함

- 대상: src/app/[locale]/error.tsx
- 원인: reset()은 다시 가져오지 않고 오류 상태만 지웁니다. 설치본 Next 16.3 문서(03-file-conventions/error.md)는 경계의 자식을 다시 가져오는 retry()를 권장합니다.
- 수정: retry()를 호출합니다.

## 입력·접근성

### 로그인 사용자의 로고 불투명도 슬라이더가 키 입력마다 포커스를 잃음

- 대상: src/features/display-settings/display-settings.tsx, checker-workspace.tsx, src/entities/preferences/preferences.query.ts
- 원인: 키보드 입력은 매번 commit되어 저장이 시작되고, 저장 중 Slider가 disabled가 되면 thumb의 tabIndex가 사라집니다.
- 수정: Slider의 저장 중 비활성화를 제거하고 저장 중에도 다음 값을 받습니다. 연속 저장의 응답 순서 역전을 막기 위해 mutation scope로 직렬 실행합니다. 버전 표시 토글의 저장 중 비활성화는 유지합니다.

### 포인터로 상세를 연 뒤 같은 카드의 첫 키보드 입력이 무시됨

- 대상: src/features/chart-card-grid/chart-card.tsx
- 원인: 우클릭이나 길게 누르기로 상세를 열면 click 억제 플래그가 남고, 다이얼로그를 닫은 뒤의 첫 Enter·Space가 그 플래그로 버려졌습니다.
- 수정: 키보드에서 발생한 click(detail 0)은 억제하지 않고 플래그는 항상 초기화합니다.

## 로딩

### 모바일 초기 로딩 폴백의 목록 스켈레톤 높이가 0

- 대상: src/widgets/checker-workspace/checker-loading.tsx
- 원인: 모바일 문서 스크롤 전환 이후 목록 컨테이너의 높이가 auto가 되어 자식의 h-full이 0이 됐습니다.
- 수정: 워크스페이스 내부 스켈레톤과 같은 최소 높이를 줍니다.

## 스크립트

### typecheck가 낡은 라우트 타입으로 실패

- 대상: package.json
- 증상: [locale] 라우트 도입 전에 생성된 .next/types가 남아 tsc --noEmit이 오류 6건으로 실패했습니다.
- 수정: 설치본 Next 문서(06-cli/next.md)의 안내대로 next typegen을 선행합니다.

### 수집 스크립트가 DB 연결을 닫지 않음

- 대상: scripts/sync-source.ts
- 원인: 다른 스크립트와 달리 클라이언트를 닫지 않아 원격 libSQL 연결에서 프로세스가 종료되지 않을 수 있습니다.
- 수정: finally에서 클라이언트를 닫습니다.

## 검증

- bun run typecheck 종료 코드 0, bun run lint 오류 0·경고 3(기존 캐시 키 인자 3건과 동일), bun test 17 pass.
- 임시 SQLite에서 upsertRecord 실행: 새 행의 memo ''·scoreGrade null, 값 지정 후 필드를 생략한 호출에서 memo·scoreGrade 유지, '' 와 null 명시 시 삭제, 비활성 곡 null 반환, revision 4·행 수 1. 13개 단언 일치.
- bun run build: 임시 SQLite를 DATABASE_URL로 지정한 실행에서 종료 코드 0, 홈 3개 로케일 Partial Prerender. 로컬 기존 환경의 빌드는 DATABASE_URL이 libSQL 클라이언트가 지원하지 않는 turso: 스킴이라 이번 변경과 무관하게 실패했습니다(URL_SCHEME_NOT_SUPPORTED). 환경 파일은 열람·수정하지 않았습니다.
- 브라우저 재현은 하지 않았습니다. 탭 복귀 시 폼 유지, 하이드레이션 경고 소멸, 슬라이더 포커스 유지, 키보드 클릭은 코드와 라이브러리 소스 근거로 판정했습니다.

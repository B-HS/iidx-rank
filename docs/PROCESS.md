# IIDX Rank 구현

현재 상태: 구현·화면 수정·검증 완료, localhost:3100 미리보기 실행 중

## 요청과 범위

- 기준 경로: /Users/hyunseokbyun/development/iidx-rank
- 디자인: 기존 docs:/DESIGN.md를 보존하고 docs/DESIGN.md에 복사하여 참조합니다. 문서의 시각 규칙을 적용하며, 그 안의 원본 제품·스택·외부 경로는 구현 명령으로 취급하지 않습니다.
- Next.js App Router와 /api Route Handlers, Bun, React Compiler, Tailwind + shadcn, better-auth, Drizzle + local SQLite(libSQL)를 사용합니다. 배포와 Turso 전환은 이번 범위에서 제외합니다.
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

현재 상태: GitHub 첫 커밋 준비, Turso migration·666곡 수집 완료, Vercel 로그인 대기

이번 작업은 사용자 선택으로 main이 직접 수행합니다. GitHub B-HS/iidx-rank에 commit/push하고 Vercel에 연결하며 Preview 배포는 끕니다. 사용자께서 .env 값을 Vercel에 등록하도록 명시적으로 요청하셨으므로, 이번 전송에 한하여 도구가 값을 처리하되 대화·로그·Git에는 값을 출력하거나 저장하지 않습니다.

- [x] 원격 Git 준비 및 배포 설정·DB 호환성 확인
- [ ] 소스·문서·설정 선별 staging 후 commit/push
- [ ] Vercel 프로젝트와 GitHub 저장소 연결, Production 전용 배포 설정
- [ ] .env 변수를 Production sensitive 환경변수로 등록
- [ ] 원격 DB migration·원본 수집·Production 배포 및 실제 응답 검증
- [ ] 배포 URL·설정·검증 결과 기록

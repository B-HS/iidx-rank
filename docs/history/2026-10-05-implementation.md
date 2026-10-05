# IIDX Rank 구현 이력

- Next.js App Router, Cache Components/PPR, React Compiler, Bun, shadcn, better-auth, Drizzle와 로컬 SQLite 구성을 구현했습니다.
- 공개 Google Sheets의 안내·노말·하드 HTML을 직접 파싱합니다. 실제 666곡과 게시일 2026-09-24를 확인했고 색상 상속을 해석하여 개인차 표시를 보존했습니다. 기존 외부 JSON과 원본의 차이가 있어 HTML을 단일 수집 원본으로 사용합니다.
- 공개 목록 및 인증 사용자 기록 조회·저장·원본 동기화·개인 캐시 갱신 API를 구현했습니다. UUID와 revision으로 서버·클라이언트 캐시를 분리합니다.
- 인증 전환 시 이전 계정 데이터 표시를 차단하는 UI gate와 QueryClient 제거를 적용했습니다. 세션 인증은 use cache 바깥에서 수행합니다.
- 초기 표 화면 이후 사용자 요청에 따라 외곽 패딩 제거, 우측 필터의 좌측 통합, 모바일 최소 3열 카드 화면으로 수정했습니다. 최신 요청은 기존 디자인 문서의 패딩·3단·표 구성보다 우선합니다.
- 실제 검증 결과와 남은 운영 검증은 docs/quality-assurance/implementation.md에 기록합니다.
- 프로젝트에 Git 저장소와 remote가 없어 commit/push는 실행하지 않았습니다.

## UI 수정 결과

대상 파일: src/widgets/app-shell/app-shell.tsx, src/widgets/checker-workspace/checker-workspace.tsx, src/widgets/checker-workspace/checker-loading.tsx, src/features/chart-card-grid/chart-card-grid.tsx, src/app/page.tsx, src/app/globals.css.

변경 후 build·UI ESLint·전체 대상 Prettier가 통과했습니다. CUA 브라우저에서 desktop 2단·padding 0, mobile CSS 390px의 3열 및 검색·상세 접근을 확인했습니다. 미리보기는 localhost:3100에서 실제 로컬 SQLite로 실행합니다.

브라우저 접힘 검사에서 필터가 좁은 rail에 남는 현상을 확인하여 AppShell slot wrapper에 collapsed 상태 숨김을 추가했습니다. 접힘·펼침·모바일 표시를 실제 화면에서 재검증했습니다.

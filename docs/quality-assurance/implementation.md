# 구현 검증

현재 상태: 데이터·인증·최신 UI 변경 검증 완료

## 완료한 검증

- [x] 공개 HTML 파서: `bun --no-env-file test`에서 8개 테스트 통과. 실제 fixture 666곡, 게시일 2026-09-24, 색상 상속·개인차와 패턴 표시 구분·곡명 alias·잘못된 개수·표 누락을 검증했습니다.
- [x] SQLite: Drizzle 8개 테이블 migration 생성·적용, 실제 원본 수집 성공. 정상 스냅샷 666곡이 저장되었습니다.
- [x] Next 프로덕션 빌드: 최신 UI 변경 전 성공. 홈은 Partial Prerender, API는 요청 시간 경로로 확인했습니다.
- [x] HTTP: 별도 임시 SQLite와 localhost:3100 프로덕션 서버에서 67개 assertion 통과, 실패 0. 회원가입·로그인·로그아웃, 사용자 A/B 기록 분리, 저장 직후 재조회, 임의 UUID/태그 무시, 캐시 갱신, 인증·origin·JSON 검증, 원본 동기화 cooldown, 인증 응답 no-store를 확인했습니다. 테스트 계정은 실제 앱 DB에 넣지 않았습니다.
- [x] ESLint: 최신 UI 변경 전 오류 0. Next 캐시 함수 인자 `_generation`, `_revision`은 함수 본문에서 사용하지 않으므로 경고 2개가 있습니다. 함수 인자는 Next 캐시 키에 포함되어 스냅샷·사용자 기록 revision을 구분합니다. 경고 억제 코드는 사용하지 않았습니다.

## UI 변경 검증

- [x] 변경 후 Next 빌드 성공, 홈 Partial Prerender 유지. 변경 파일 ESLint 오류 0 및 전체 대상 Prettier 통과
- [x] 데스크톱 CSS 1520px: 좌측 통합 필터·콘텐츠 2단, 카드 6열, 콘텐츠 및 sidebar-content computed padding 0px, 우측 aside 없음
- [x] 모바일 CSS 390×844: 3열(각 약129px), 첫 세 카드의 y 동일, document scrollWidth 390px, 가로 overflow 없음
- [x] 좌측 모바일 drawer에서 Adularia 검색 → 1개 카드 → 상세 dialog의 곡명·노멀 C·개인차·램프·메모 확인. 익명 사용자 저장에는 로그인 안내 유지

- [x] 접힌 desktop sidebar에서 통합 필터 숨김, 약48px rail 확인. 펼친 desktop 및 mobile drawer에서 필터 표시 유지. 수정 후 build와 단일파일 ESLint 통과

## 재현 절차

프로젝트 루트에서 `bun run db:migrate`, `bun run source:sync`, `bun run build`를 실행합니다. 인증 secret은 본인이 실행 환경에 제공하고 URL을 실행 주소와 맞춥니다. 별도 테스트 DB에서 A/B 계정을 만들어 A의 기록을 저장하고 B가 조회할 때 해당 기록이 없는지 확인합니다. A에서 저장 직후 재조회와 개인 캐시 갱신을 확인하고 로그아웃 뒤 기록 조회가 401인지 확인합니다. 테스트용 임시 HTTP 스크립트는 검증 후 제거했습니다.

## 남은 운영 검증

- Turso와 다중 인스턴스는 아직 배포하지 않았습니다. 배포 시 태그 전파·공유 잠금·동시 쓰기·DB 연결을 검증해야 합니다.
- 네트워크 단절과 다중 프로세스 동기화 경합을 강제로 만드는 검사는 미실행입니다. 정상 스냅샷 유지와 DB cooldown 로직은 구현되어 있으나 실제 장애 재현은 운영 환경 확정 시 수행합니다.
- e-amusement 실제 연동은 구현 범위 밖이며 docs/E-AMUSEMENT.md에 계획만 기록했습니다.

## 대상 파일과 결과

src/widgets/app-shell/app-shell.tsx의 sidebarContent 슬롯과 src/widgets/checker-workspace/checker-workspace.tsx의 조립을 변경했습니다. src/features/chart-card-grid/chart-card-grid.tsx는 shadcn Card로 두 랭크와 개인차를 압축 표시합니다. src/app/page.tsx 및 checker-loading.tsx의 Suspense fallback은 중첩 셸 없이 정적 로딩 구조를 유지합니다. 상세 편집 API는 변경하지 않았으므로 기존 67개 HTTP 검증 결과를 재사용했습니다. 실제 브라우저의 로그인 후 저장 과정은 이번 UI 검사에 포함하지 않았습니다.

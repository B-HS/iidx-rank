# 카드 밀도와 필터·설정 모달

## 대상 파일

카드와 빈칸: src/features/chart-card-grid/. 랭크 접기: src/features/chart-rank-section/ 및 src/shared/ui/collapsible*. 사이드바·모달: src/widgets/app-shell/, src/widgets/checker-workspace/. 기본값: src/shared/constants/display.ts, src/app/globals.css, drizzle/0003_abandoned_the_executioner.sql.

## 리포트

- 로고 카드의 시리즈 행을 레이아웃에서 제외하고 버튼 높이를 40px로 고정했습니다. 곡명 두 줄과 작은 DJ 랭크를 유지합니다. 빈칸도 같은 높이로 맞추고, 시리즈명 모드는 기존 제목·버전 행을 유지합니다.
- 비로그인 및 설정 미저장 계정의 로고 불투명도는 10%입니다. 기존 저장 설정을 덮어쓰지 않습니다. Drizzle 생성 migration은 기존 값을 복사하며 DB 기본값만 10으로 변경합니다.
- 랭크 사이 gap-3을 제거했습니다. shadcn 공식 registry를 기존 Radix 의존성과 arrow FC 규칙으로 적용한 Collapsible이 전체 랭크 헤더 클릭·Enter·Space를 지원합니다.
- 사용자 메뉴의 설정 항목으로 표시 설정 모달을 엽니다. 비로그인·로그인 및 접힌 메뉴에서도 접근 가능하며 로그인/로그아웃 항목을 유지합니다. 곡 필터는 콘텐츠 헤더 아이콘 버튼으로 모달을 엽니다. 필터 값은 닫아도 유지됩니다.
- 사이드바와 스켈레톤에는 원본 목록과 진행 상황만 남깁니다. 사용자 설정 API, UUID/revision 캐시·prefetch, 램프와 DJ 랭크 저장 계약은 유지했습니다.

## 상세와 검증

Next.js 로컬 Server and Client Components 가이드, Radix 공식 Collapsible 문서, shadcn new-york-v4 registry를 확인했습니다. 새 의존성은 없습니다.

.env를 복사하지 않은 /private/tmp/iidx-rank-clean-build-Lmjy8e에서 bun --no-env-file run build 성공: 컴파일·TypeScript·9개 정적 경로 생성, 홈 PPR·Cache Components 유지. 제한 환경에서 첫 빌드가 진행되지 않아 중단하고 권한이 있는 동일 복사본에서 성공 결과를 얻었습니다.

임시 SQLite migration: 기존 title / opacity 70 / revision 7 보존, 새 DB default logo / 10 확인, catalog 667개(기존 비활성 QA 항목 포함) 보존. 생성한 migration fixture를 제거했습니다. 같은 migration을 로컬 data/iidx.db에도 성공 적용했습니다.

임시 HTTP: 미인증 설정 401, 미설정 사용자 기본 logo / 10, 저장 및 재조회 opacity 20, 다른 UUID 기본 10 유지, title / 20 / revision 2 DB 저장 확인. 신규 QA 계정 2개 및 연결 데이터만 제거했습니다.

실제 DOM: 1280px 로고 버튼 40px·카드 42px, 불투명도 0.1, 랭크 간 간격 0px. 클릭 접기 시 해당 목록 0개·aria-expanded false, Enter/Space 펼침 동작. 검색 Beyond Evolution 결과 1개·모달 재열기 값 유지, 하드 모드 헤더 전환. 사용자 메뉴 설정·로그인 모달, 시리즈명/로고 변경·슬라이더 20% 미리보기 확인.

390×844 모바일: 130px 3열·모든 로고 카드 42px, document width 390px로 가로 넘침 없음. 곡 필터 모달 bounds x16..374 / y155.65..688.35, 모바일 사이드바에서 설정 모달 열기·닫기 성공. 데스크톱 접힌 메뉴 너비 48px·가로 넘침 없음·설정 모달 접근 성공.

## Production 완료

구현 commit b5f7e4942cf5b1a173fb22e7852a764d915c11e9, 배포 https://iidx-rank-nxh32d7p4-b-hs-projects.vercel.app READY. 운영 https://iidx-rank.vercel.app/에서 카드 666개·42px·opacity 0.1·랭크 간 간격 0px, 사이드바 원본/진행만 표시, 접기와 설정·필터 모달 확인했습니다. 설정 모달 기본값 10. 모바일 390px 3열·가로 넘침 없음·곡 필터 모달 너비 358px 확인했습니다.

Vercel inspect --logs: db:migrate → db:seed-admins → build 모두 성공. Cache Components 및 홈 PPR 유지. 새 운영 계정을 만들거나 기존 사용자의 설정을 변경하지 않았습니다.

운영 캡처: iidx-rank-compact-controls.png, iidx-rank-compact-mobile.png (대화 outputs). 테스트 서버와 임시 브라우저 탭을 종료하고 viewport를 복원했습니다.

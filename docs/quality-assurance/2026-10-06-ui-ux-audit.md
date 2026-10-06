# UI/UX 감사 (2026-10-06)

현재 상태: 즉시 적용 항목 23건 수정 완료(타입체크·린트·테스트·빌드 통과), 브라우저 확인이 필요한 항목은 아래 목록대로 미확인

사용자 결정에 따라 일관성·접근성처럼 판단이 분명한 항목만 적용하고, 디자인 판단이 큰 항목은 목록으로 남깁니다. 감사는 코드와 docs/DESIGN.md, 설치본 라이브러리 소스를 읽는 방식으로 했으며 브라우저 확인이 필요한 항목은 따로 표시했습니다.

## 즉시 적용 항목

### 셸 (src/widgets/app-shell/app-shell.tsx)

- [x] U1 main 랜드마크 중첩 — SidebarInset(src/shared/ui/sidebar.tsx)이 이미 main을 렌더하므로 app-shell.tsx 안쪽의 main을 div로 바꿉니다(클래스 유지). 셸 밖의 error.tsx·not-found.tsx의 main은 유지합니다.
- [x] U16 언어 전환 시 쿼리스트링 유실 — router.replace(pathname, { locale })가 ?page= 를 버립니다. 이벤트 핸들러 안에서 window.location.search를 읽어 { pathname, query } 형태로 넘깁니다(next-intl createNavigation의 href는 string 또는 { pathname, query }). useSearchParams는 Suspense 요구가 생기므로 쓰지 않습니다.
- [x] U21 접힌 사이드바의 보이지 않는 링크 — 앱 이름 링크의 안쪽 span만 숨겨져 폭 0 링크가 Tab 순서에 남습니다. group-data-[collapsible=icon]:hidden을 span에서 Link로 옮깁니다.

### 오류 코드 전달 (가장 큰 항목)

- [x] U3 API 오류 코드 유실과 한국어 고정 문구
    - src/shared/lib/api-client.ts: ko.json import를 제거하고, 봉투 오류는 서버 code를 Error의 cause에 실어 던지며 그 밖의 실패는 공통 코드 상수를 cause로 씁니다. getApiErrorCode(error: unknown)를 export 합니다.
    - src/entities/board/board-error.ts 신설(src/entities/auth/auth-error.ts의 getAuthErrorKey와 같은 형태): RATE_LIMITED → board.errorRateLimited, FORBIDDEN → board.errorForbidden, VALIDATION_ERROR·INVALID_CONTENT → board.errorInvalidInput, 그 외 null.
    - 서버 메시지를 그대로 화면에 쓰는 곳을 번역 키로 교체: src/widgets/board-post/board-comments.tsx, src/widgets/board-editor/board-post-create.tsx, board-post-edit.tsx, board-post-form.tsx(업로드 실패 toast description은 PAYLOAD_TOO_LARGE → board.imageSizeError, UNSUPPORTED_MEDIA_TYPE → board.imageTypeError 매핑 또는 제거).
    - 핸들 중복: src/widgets/profile-settings/profile-settings-form.tsx의 저장 onError에서 코드가 HANDLE_TAKEN이면 handle 필드에 오류를 세우고 포커스합니다. src/entities/profile/profile.query.ts의 toast도 같은 분기.
    - 메시지: settings.handleTaken "이미 사용 중인 핸들입니다. 다른 핸들을 입력해 주세요." / "このハンドルはすでに使用されています。別のハンドルを入力してください。" / "This handle is already taken. Enter a different one."; settings.saveError "프로필을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." / "プロフィールを保存できませんでした。しばらくしてからもう一度お試しください。" / "Could not save the profile. Please try again shortly."; board.errorRateLimited "작성이 너무 잦습니다. 잠시 후 다시 시도해 주세요." / "投稿の間隔が短すぎます。しばらくしてからもう一度お試しください。" / "You are posting too often. Please try again shortly."; board.errorForbidden "이 작업을 수행할 권한이 없습니다." / "この操作を行う権限がありません。" / "You do not have permission to do this."; board.errorInvalidInput "입력한 내용을 확인해 주세요." / "入力内容を確認してください。" / "Please check what you entered."
    - api-client의 공통 실패 문구는 호출부가 번역 키로 표시하도록 하고, 기존 호출부(checker·preferences·catalog의 query 훅)는 이미 자체 번역 toast를 띄우는지 확인합니다.

### 난이도표

- [x] U4 버전 필터가 사전순 — src/entities/catalog/catalog-series.ts에서 버전 정규화 식을 함수로 추출하고(로고 조회와 정렬 2곳 사용) 시리즈 순서 비교 함수를 export 합니다(미등록 버전은 맨 뒤, 동률은 localeCompare). checker-workspace.tsx의 versions 정렬에 사용합니다. 오름차순(1st → 최신)입니다.
- [x] U6 클릭해도 변하지 않는 상위 램프에 피드백 없음 — checker-workspace.tsx의 handleAdvanceLamp에서 다음 램프가 현재와 같으면 toast.info(checker.lampLocked)를 고정 toast id로 띄웁니다. 메시지: "이 램프는 클릭으로 바꿀 수 없습니다. 길게 눌러 상세 기록에서 변경해 주세요." / "このランプはクリックでは変更できません。長押しして記録編集から変更してください。" / "This lamp can't be changed by clicking. Hold to edit it in the record."
- [x] U7 필터 다이얼로그의 "랭크" 레이블 중복 — src/features/checker-filters/checker-filters.tsx의 게이지 모드 토글 레이블을 checker.modeLabel("게이지" / "ゲージ" / "Gauge")로 바꿉니다.
- [x] U5 진행률 막대가 값을 전달하지 않음 — src/shared/ui/progress.tsx의 Root에 value를 넘깁니다(aria-valuenow). 호출부는 checker-workspace.tsx와 src/features/profile-lamp-summary/profile-lamp-summary.tsx.
- [x] U17 카드 툴팁에 램프명 없음, 상태 점의 잘못된 aria — src/features/chart-card-grid/chart-card.tsx의 title에 램프명을 넣고, checker-workspace.tsx 사이드바 원본 상태 점은 aria-label을 지우고 aria-hidden으로 둡니다(같은 문구가 바로 아래에 있음).
- [x] U13 표시 설정 토글 모양 불일치 — src/features/display-settings/display-settings.tsx의 ToggleGroup에 variant='outline' size='sm' spacing={0}을 주고 Label을 aria-labelledby로 연결합니다(checker-filters·board-post-form과 같은 방식).
- [x] U22 문자열 결합으로 만든 레이블 — 미등록 섹션이 "랭크 미등록 랭크"(en "Unrated rating")로, 헤더가 en에서 "Normal gauge Difficulty table"로 읽힙니다. 섹션 레이블을 호출부에서 계산해 prop으로 넘기고(checker.rankSectionLabel "{rank} 랭크" / "{rank}ランク" / "{rank} rating", 미등록은 checker.noRank), 헤더는 checker.headingWithMode "{mode} 난이도표" / "{mode}難易度表" / "{mode} difficulty table". 대상: src/features/chart-rank-section/chart-rank-section.tsx, src/features/checker-skeleton/chart-rank-skeleton.tsx, checker-workspace.tsx, checker-loading.tsx. checker.rankSection은 제거합니다.
- [x] U25 상세 다이얼로그에서 곡명이 잘림 — src/features/chart-details/chart-details.tsx의 DialogTitle을 truncate 대신 줄바꿈(pr-8 leading-snug break-words)으로 바꿉니다.

### 사용자 페이지·설정·인증

- [x] U9 팔로우 버튼의 이중 상태 표현 — 레이블이 팔로우/언팔로우로 바뀌므로 src/features/follow-button/follow-button.tsx의 aria-pressed를 제거합니다.
- [x] U18 플레이 기록 로드 실패에 재시도 없음 — src/features/profile-records-status/profile-records-status.tsx에 onRetry prop과 재시도 버튼(common.retry)을 추가하고 두 탭이 refetch를 넘깁니다.
- [x] U19 볼 수 없는 프로필 화면에 이동 경로 없음 — src/widgets/user-page/user-page.tsx의 안내 빈 상태에 홈으로 가는 버튼을 추가합니다.
- [x] U10 로그인 다이얼로그 폭 클래스 오류 — src/features/auth-dialog/auth-dialog.tsx의 max-w-md가 기본 모바일 여백 규칙을 덮어씁니다. sm:max-w-md로 바꿉니다.
- [x] U20 같은 항목의 다른 이름 — 가입 폼 "표시 이름"을 설정과 같은 "닉네임"으로 통일(auth.nameLabel, auth.nameRequired: "닉네임" / "ニックネーム" / "Nickname", "닉네임을 입력해 주세요." / "ニックネームを入力してください。" / "Enter a nickname."). en settings.signInTitle을 "Sign-in required."로 통일합니다.

### 게시판·공통

- [x] U8 링만 없앤 포커스 표시 — outline-none 뒤에 대체 링이 없습니다. src/widgets/recent-users/recent-users.tsx(focus-visible:ring-2 ring-inset ring-sidebar-ring), src/widgets/board-list/board-post-list-item.tsx와 src/features/user-name-menu/user-name-menu.tsx(focus-visible:ring-[3px] ring-ring/50).
- [x] U15 주 제출 버튼 variant 불일치 — 설정 저장·기록 저장·로그인은 기본(채움)인데 게시글·댓글 등록만 outline입니다. src/widgets/board-editor/board-post-form.tsx와 src/features/board-comment-form/board-comment-form.tsx의 제출 버튼에서 variant='outline'을 제거합니다.
- [x] U11 다크 테마에서 toast가 밝은 색 — sonner 기본 theme이 light입니다. src/shared/providers/app-toaster.tsx를 만들어 next-themes의 resolvedTheme을 Toaster theme으로 넘깁니다.
- [x] U14 오류·404 화면의 형식 차이 — src/app/[locale]/error.tsx의 세로 정렬(min-h-dvh), 두 화면의 버튼 size='sm', 제목을 h1으로.
- [x] U12 숫자 표기 혼재와 en 복수형 — 메시지의 {count}를 {count, number}로, en의 followerCount·playedCount는 plural로. 호출부가 미리 toLocaleString 한 값을 넘기는 곳(src/features/profile-header/profile-header.tsx)은 숫자를 그대로 넘깁니다. ICU 인자 형식의 실제 동작은 next-intl 설치본으로 확인 후 적용합니다.
- [x] U2 모든 페이지의 문서 제목이 같음 — src/app/[locale]/layout.tsx의 title을 { template, default }로 바꾸고 (shell) 아래 각 페이지에 generateMetadata로 제목을 줍니다(홈 navigation.home, 난이도표 navigation.checker, 게시판 navigation.board, 글쓰기 board.createTitle, 수정 board.editTitle, 사용자 페이지 profile.pageTitle, 설정 settings.title). Cache Components 빌드 통과를 확인합니다.
- [x] U24 미사용 메시지 키 정리 — U3·U22 이후 정적 검색으로 다시 확인한 뒤 3개 언어에서 제거합니다. 후보: auth 7(title, description, namePlaceholder, emailPlaceholder, passwordPlaceholder, emailRequired, passwordRequired), checker 30(loadingFilters, loadingCatalog, noRankShort, sort*, results, totalCharts, recordedCharts, column*, openDetails, editRecord, detailTitle, keyboardDetails, noCharts, loadErrorTitle, loadErrorDescription, sourceStale, sourceStaleTitle, sourceSyncRequiresSignIn), common(account, search, 그리고 U3 이후 unknownError), navigation.filters. 동적 키(lamp.*, difficulty.*, rank.*, profile.tab*, board.editor*, navigation의 메뉴 키)는 유지합니다.

## 보고만 — 결정이 필요한 항목

1. reduced-motion에서 램프 구분 불가 — 깜빡임이 멈추면 EX_HARD와 FAILED가 같은 빨강, HARD와 FULL_COMBO가 같은 흰색이 되고 라이트 테마의 흰 카드에서 HARD 띠가 보이지 않습니다. 선택지: 두 색을 위아래로 나눈 정적 표시 / 카드에 램프 약어 표기 / 유지.
2. 시각이 Asia/Tokyo 고정이고 시간대 표기가 없음 — 유지 / 시간대 표기 / 클라이언트 현지 시각.
3. 스크롤바 전역 숨김(globals.css) — 유지 / 얇은 스크롤바 복원.
4. 28px 아이콘 버튼의 터치 대상 — 헤더 버튼, 댓글 삭제, 다이얼로그 닫기, 에디터 툴바. 모바일 한정 확대 여부.
5. 비로그인 진입 경로 — 하단 버튼이 "사용자 메뉴"로만 보이고 로그인·언어가 드롭다운 안에 있습니다.
6. 사이드바 구조 — 게시판 항목이 가변 영역 아래에 있어 위치가 페이지마다 달라지고 nav 랜드마크가 없습니다.
7. 오류·404가 셸 밖에서 렌더 — 오류 시 내비게이션이 사라집니다. (shell)/error.tsx 추가, 매칭되지 않는 URL 처리.
8. 필터 상태 표시 — 필터가 적용돼도 버튼에 표시가 없고 모바일에서 결과 수가 숨겨집니다. 게이지 모드 전환이 필터 다이얼로그 안에 있습니다.
9. 설정 저장 버튼 위치와 미저장 이탈 경고 — 설정 폼과 게시글 편집기 모두 이탈 경고가 없습니다.
10. URL에 반영되지 않는 상태 — 사용자 페이지 탭, 댓글 페이지.
11. 게시판 세부 — 일반 사용자에게도 보이는 "종류: 일반" 표시, 목록 행에서 제목 글자만 클릭됨, 툴바의 화살표 키 이동 없음(Tab 정지점 16개 이상), 본문 이미지 alt 입력 수단 없음, 본문 오류와 에디터의 aria-describedby 미연결.
12. 동적 문서 제목 — 게시글 제목·사용자 이름을 문서 제목에 넣을지.
13. 용어·어투 — en "Unable to"와 "Could not" 혼용, ja "取得できませんでした"와 "読み込めませんでした" 혼용, ko "곡"과 "보면" 혼용, en "ranks"와 "rating", en checker.standardGroup "Technical"이 ko "지력"·ja "地力"과 뜻이 다름.
14. toast 정책 — sonner 기본 모서리·그림자가 rounded-none 기조와 다름, 변경 실패 시 toast와 인라인 오류를 함께 보일지.
15. 최근 사용자 목록 — 행 높이 32px(메뉴 항목 규칙은 36px), 로드 실패 시 재시도 없음.
16. 터치·키보드 발견성 — 길게 누르기 안내가 title에만 있어 터치 기기에서 보이지 않음.

## 문제 없다고 확인한 영역

- 난이도표 툴바와 다른 페이지 헤더는 같은 CSS 규칙을 써서 모양이 같습니다.
- 셸 안의 모든 페이지에 h1이 하나씩 있고 제목 계층이 맞습니다.
- 모든 다이얼로그·모바일 시트에 제목과 설명이 있고, 폼은 label·aria-invalid·aria-describedby·role='alert'를 갖췄습니다.
- 글·댓글 삭제와 차단에 확인 다이얼로그가 있습니다.
- 빈 상태(Empty + outline sm 버튼)와 로딩(role='status' 스켈레톤) 형식이 통일돼 있습니다.

## 브라우저 확인이 필요한 항목

- 모바일에서 로그인 다이얼로그 여백(U10), 다크 테마 toast(U11), 포커스 링이 부모 overflow에 잘리는지(U8).
- 모바일 sticky 겹침: 페이지 헤더, 랭크 헤더, 에디터 툴바.
- 표시 설정 안내문의 고정 높이가 en·ja에서 넘치는지, /table 사이드바에서 슬롯과 최근 사용자 목록 사이 경계선.

## 적용 결과와 추가 관찰

- 즉시 적용 항목은 모두 반영했습니다. 페이지별 문서 제목은 로컬 서버 응답으로 확인했습니다(홈 "홈 | IIDX Rank", /table "난이도표 | IIDX Rank", /board "게시판 | IIDX Rank", /board/new "글쓰기 | IIDX Rank", /settings "프로필 설정 | IIDX Rank", /u/<핸들> "사용자 페이지 | IIDX Rank", /en "Home | IIDX Rank", /ja/board "掲示板 | IIDX Rank").
- 숫자 표기는 use-intl 포매터로 실행해 확인했습니다(en "1 follower", "1,234 followers", ko "팔로워 1,234명").
- 미사용 메시지 키 43개를 3개 언어에서 제거했습니다(common 3, navigation 1, auth 7, checker 32). 최종 키 수는 언어별 341개이며 정적 키 누락과 미사용이 0입니다.
- 통합 검증에서 추가로 반영한 것: 로그인 다이얼로그가 닫힐 때 로그인 모드로 돌아가도록 수정, 본문 목록 마커 색을 보조 텍스트 색으로 지정.
- 보고만 목록에 추가: 게시글 상세의 글 제목과 본문의 "큰 제목"이 모두 h2라 제목 위계가 같습니다. 가입 모드로 연 다이얼로그를 닫는 페이드 동안 제목이 "로그인"으로 바뀌어 보일 수 있습니다. 오류 코드가 매핑되지 않은 실패에서는 toast와 같은 문장이 폼 아래에도 표시됩니다.

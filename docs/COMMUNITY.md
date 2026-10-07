# 커뮤니티 기능 구현 계약

2026-10-06 사용자 결정에 따른 사용자 페이지·팔로우·최근 갱신 목록·게시판·차단·파일 저장의 구현 계약입니다. 기존 계약(docs/ARCHITECTURE.md, docs/CACHE.md)을 전제로 하며, 여기 적힌 이름·경로·형식은 작업자 간 공통 기준입니다.

## 결정

- 사용자 주소는 고유 핸들 /u/<핸들>. 프로필 공개 기본값은 비공개. 비공개 프로필은 본인만 봅니다.
- 프로필 사진과 게시판 본문 이미지는 Cloudflare R2에 저장합니다. 이미지 기능은 빼지 않습니다.
- 게시판은 글·댓글·본문 이미지, 공지는 관리자만 작성·수정·삭제하고 목록 상단에 고정합니다. 읽기는 누구나, 쓰기는 로그인 사용자.
- 차단은 차단한 사용자의 글·댓글을 숨기고 설정에서 해제합니다. 공지는 차단과 무관하게 표시합니다.
- 홈은 /, 난이도표는 /table. 홈은 로그인 사용자에게 내 정보·노트레이더·램프 현황·랭크별 달성·최근 플레이곡·게시판 활동을, 비로그인 사용자에게 로그인 안내와 난이도표 현황·공지·최근 글을 보여 줍니다.
- DP 난이도표: 현재 원본 스프레드시트(☆12参考表)의 8개 탭은 모두 SP 전용이라 DP 원본이 없습니다. 사용자 결정으로 이번 범위에서 제외합니다.

## 라우트

모두 src/app/[locale]/(shell)/ 아래이며 (shell)/layout.tsx가 AppShell을 한 번만 렌더합니다.

| 경로 | 파일 | 내용 |
|---|---|---|
| / | (shell)/page.tsx | 홈 대시보드 |
| /table | (shell)/table/page.tsx | 기존 난이도표 |
| /u/[handle] | (shell)/u/[handle]/page.tsx | 사용자 페이지 |
| /users | (shell)/users/page.tsx | 사용자 목록(?page=) |
| /settings | (shell)/settings/page.tsx | 프로필 설정·공개 범위·차단 목록 |
| /board | (shell)/board/page.tsx | 게시판 목록(?page=) |
| /board/new | (shell)/board/new/page.tsx | 글쓰기 |
| /board/[postId] | (shell)/board/[postId]/page.tsx | 글 상세·댓글 |
| /board/[postId]/edit | (shell)/board/[postId]/edit/page.tsx | 글 수정 |

cacheComponents 환경이므로 요청시간 데이터(세션·params·searchParams)는 Suspense 아래에서 읽습니다. 링크는 @shared/i18n/navigation의 Link를 사용합니다.

## 셸

- src/widgets/app-shell/app-shell.tsx가 사이드바와 본문 틀을 가집니다. 메뉴는 nav 랜드마크 하나로 묶으며 순서는 홈, 사용자, 게시판, 난이도표이고 그 아래에 페이지별 슬롯, 하단(테마·언어·계정)이 옵니다. 난이도표는 누르면 원본·진행 패널이 슬롯에 펼쳐지므로 항상 메뉴의 맨 아래에 둡니다.
- 내비게이션 항목은 src/widgets/app-shell/shell-nav.ts의 배열 SHELL_PRIMARY_NAV_ITEMS(홈·난이도표), SHELL_SECONDARY_NAV_ITEMS(게시판)에 추가합니다. 항목은 { href, labelKey, icon }이며 활성 판정은 경로 접두 일치입니다.
- 페이지별 사이드바 내용은 src/widgets/app-shell/shell-sidebar-portal.tsx의 ShellSidebarPortal로 슬롯에 그립니다. 페이지 위젯은 AppShell을 직접 감싸지 않습니다.
- 사용자 목록은 사이드바가 아니라 별도 페이지 /users(src/widgets/user-list)에서 보여 줍니다.
- 하단 컨트롤: 테마 전환, 언어 선택(누구에게나 보이는 별도 메뉴), 계정. 비로그인 상태의 계정 칸은 바로 로그인 다이얼로그를 여는 로그인 버튼이고, 로그인 상태의 계정 메뉴는 내 페이지·프로필 설정·로그아웃입니다. 난이도표의 표시 설정(로고·불투명도)은 /table 툴바의 버튼으로 엽니다.

## DB

SQLite(libSQL)·Drizzle. 컬럼은 snake_case, 필드는 camelCase, 시각은 ISO 문자열(text)입니다. 스키마 파일은 src/shared/server/db/ 아래입니다.

profile-schema.ts
- user_profile: user_id PK(FK user, cascade), handle unique not null, bio not null default '', avatar_key null, is_public boolean not null default false, created_at, updated_at
- user_follow: follower_id, followee_id(FK user, cascade), created_at. PK(follower_id, followee_id), index(followee_id)
- user_block: blocker_id, blocked_id(FK user, cascade), created_at. PK(blocker_id, blocked_id)

board-schema.ts
- board_post: id PK(UUID), author_id(FK user, cascade), kind 'notice'|'general', title, content(리치 텍스트 JSON 문자열), comment_count not null default 0, created_at, updated_at. index(kind, created_at)
- board_comment: id PK(UUID), post_id(FK board_post, cascade), author_id(FK user, cascade), content, created_at. index(post_id, created_at)

file-schema.ts
- uploaded_file: key PK, owner_id(FK user, cascade), purpose 'avatar'|'board', content_type, size, created_at. index(owner_id, created_at)

checker-schema.ts
- user_record_revision에 updated_at(text, null 허용) 추가. 기록 upsert 트랜잭션에서 함께 갱신합니다. 최근 갱신 사용자 정렬 기준입니다.

마이그레이션은 기존 계정의 user_profile 행(handle = 'user_' + UUID에서 하이픈을 뺀 앞 12자, 비공개)과 user_record_revision.updated_at(해당 사용자의 max(user_record.updated_at))을 채웁니다. 신규 계정은 better-auth의 user create after 훅에서 프로필 행을 만듭니다. 프로필 행이 없는 사용자는 비공개로 취급합니다.

## 식별자·검증 규칙

- 핸들: /^[a-z0-9_]{3,20}$/, 고유. 닉네임은 user.name(1~40자). 소개 bio는 300자 이하.
- 공개 API에서 다른 사용자를 가리킬 때는 UUID가 아니라 핸들을 씁니다.
- 파일 키: avatar/<uuid>.<확장자> 또는 board/<uuid>.<확장자>. 전체 패턴 /^(avatar|board)\/[0-9a-f-]{36}\.(jpg|png|webp|gif)$/. 공개 주소는 /api/files/<키>.
- 이미지 형식은 선언 MIME·확장자가 아니라 매직 바이트로 판정합니다. avatar는 JPEG·PNG·WebP 2MB 이하, board는 JPEG·PNG·WebP·GIF 4MB 이하(Vercel 요청 본문 4.5MB 한도). SVG는 허용하지 않습니다.
- 글 제목 1~100자, 댓글 1~1000자, 리치 텍스트 JSON 200KB 이하.
- 남용 제한(사용자별 최근 행 수 집계, 초과 시 429 RATE_LIMITED): 글 10분에 5개, 댓글 10분에 20개, 업로드 1시간에 30개.

## 리치 텍스트

- tiptap v3. 확장 목록은 src/entities/board/rich-text.extensions.ts 한 곳에 정의해 에디터(클라이언트)·검증(서버)·렌더(서버)가 공유합니다. StarterKit(Link·Underline 포함, heading은 2·3단계)과 Image를 사용합니다.
- 저장 형식은 editor.getJSON()의 JSON입니다. 서버는 getSchema + Node.fromJSON(...).check()로 구조를 검증한 뒤 값을 직접 순회 검사합니다: 루트 type이 doc, image src는 문자열이며 /api/files/board/ 키 패턴, link href는 http·https, heading level 범위, 이미지 20개 이하. 정규화된 toJSON() 결과를 저장합니다.
- 표시는 @tiptap/static-renderer의 renderToReactElement로 React 요소를 만듭니다. dangerouslySetInnerHTML을 쓰지 않습니다.
- 에디터는 immediatelyRender: false, 툴바 상태는 useEditorState로 구독합니다. 이미지 붙여넣기·드롭은 FileHandler 확장으로 받아 업로드 후 image 노드를 넣습니다.

## 파일 저장(R2)

- env: R2_ACCESS_KEY, R2_SECRET_KEY, R2_URL. R2_URL은 S3 엔드포인트와 버킷 경로(https://<계정ID>.r2.cloudflarestorage.com/<버킷>)입니다. 셋 중 하나라도 없으면 파일 API는 503 FILE_STORAGE_UNAVAILABLE을 반환합니다.
- src/shared/server/r2.ts가 aws4fetch로 서명한 PUT·GET·DELETE를 제공합니다. 객체 주소는 R2_URL + '/' + 키입니다.
- POST /api/files: multipart(file, purpose). 같은 출처·인증·형식·크기·남용 제한 확인 후 R2에 저장하고 uploaded_file에 기록합니다. 응답 { key, url }.
- GET /api/files/[...key]: 키 패턴 확인 후 R2 응답을 스트리밍합니다. Cache-Control: public, max-age=31536000, immutable. 키는 추측할 수 없는 UUID입니다.
- 클라이언트는 src/entities/file/file.api.ts의 uploadImage(file, purpose)를 사용합니다.

## API

응답 봉투와 오류 형식은 기존과 같습니다({ success, data } / { success: false, error: { code, message } }). 변경 메서드는 같은 출처 확인과 세션 인증을 거치고 입력은 Zod로 검증합니다. 응답은 private, no-store입니다(파일 GET 제외).

프로필 (entities/profile)
- GET /api/profiles/me → MyProfile { userId, handle, name, bio, avatarKey, avatarUrl, isPublic }
- PATCH /api/profiles/me ← { name, handle, bio, isPublic, avatarKey } → MyProfile. 핸들 중복은 409 HANDLE_TAKEN. avatarKey는 본인이 올린 avatar 용도 파일이어야 합니다.
- GET /api/profiles/[handle] → Profile { handle, name, bio, avatarUrl, isPublic, followerCount, followingCount, playedCount, isOwner, isFollowing }. 없거나 비공개(본인 제외)면 404 PROFILE_NOT_FOUND.
- GET /api/profiles/[handle]/records → { records: [{ chartId, title, difficulty, version, lamp, scoreGrade, updatedAt }] }. 활성 곡만, 메모는 포함하지 않습니다.
- PUT·DELETE /api/profiles/[handle]/follow → Profile. 자기 자신과 비공개 프로필은 팔로우할 수 없습니다.
- GET /api/users?page= → { users: [{ handle, name, avatarUrl, updatedAt }], pagination }. 공개 프로필 중 기록 갱신 시각 내림차순 20명씩.

playedCount는 활성 곡 중 lamp가 NO_PLAY가 아닌 기록 수입니다.

차단 (entities/block)
- GET /api/blocks → { users: [{ handle, name, avatarUrl }] }
- PUT·DELETE /api/blocks/[handle] → 같은 목록. 자기 자신은 차단할 수 없습니다.

게시판 (entities/board)
- 작성자 표기 Author { handle, name, avatarUrl, isPublic }
- GET /api/board/posts?page= → { notices: PostSummary[], posts: PostSummary[], pagination: { page, limit, total, totalPages } }. PostSummary { id, kind, title, author, commentCount, createdAt, updatedAt }. notices는 최신 공지 5개로 모든 페이지에 포함, posts는 일반 글 20개씩. 로그인 사용자가 차단한 작성자의 일반 글은 제외합니다.
- POST /api/board/posts ← { kind, title, content } → Post. kind 'notice'는 관리자만.
- GET /api/board/posts/[postId] → Post = PostSummary + { content, canEdit, canDelete }
- PATCH /api/board/posts/[postId] ← { title, content } → Post. 작성자 본인만, 공지는 관리자만.
- DELETE /api/board/posts/[postId]. 작성자 본인 또는 관리자.
- GET /api/board/posts/[postId]/comments?page= → { comments: Comment[], pagination }. Comment { id, author, content, createdAt, canDelete }. 30개씩 작성순. 차단한 작성자의 댓글은 제외합니다.
- POST /api/board/posts/[postId]/comments ← { content } → Comment
- DELETE /api/board/comments/[commentId]. 작성자 본인 또는 관리자.
- GET /api/board/mine → { posts: PostSummary[], comments: [{ id, postId, postTitle, author, excerpt, createdAt }] }. 로그인 필수(없으면 401 AUTH_REQUIRED). posts는 내가 쓴 글 최신 5개, comments는 내 글에 다른 사용자가 단 댓글 최신 8개이며 내 댓글과 차단한 작성자의 댓글은 제외합니다. excerpt는 본문 앞 80자입니다. 홈 대시보드가 사용합니다.

관리자 판정은 세션의 DB 역할(user.role === 'admin')입니다.

## 캐시·쿼리 키

- 프로필·게시판·차단 조회는 요청마다 DB에서 읽습니다. 사용자 목록만 'use cache' + RECENT_USERS_TAG('users:recent') + 60초 재검증을 쓰고(페이지 번호가 캐시 키), 기록 저장과 프로필 공개 설정·핸들·닉네임·사진 변경 시 태그를 만료합니다.
- QUERY_KEY: PROFILE { ALL, ME, DETAIL(handle), RECORDS(handle) }, USERS { ALL, LIST(page) }, BOARD { ALL, POSTS(params), POST(id), COMMENTS(postId, page), MINE }, BLOCK { ALL, LIST }.
- 계정 전환 시 기존 QueryClient.clear 계약이 그대로 적용됩니다.

## 화면

- 사용자 페이지 머리: 프로필 사진, 닉네임, @핸들 · 팔로워 수 · 플레이한 보면 수, 소개, 버튼(본인은 프로필 설정, 타인은 팔로우/언팔로우). 그 아래 탭. 탭은 배열 레지스트리로 정의해 항목 추가만으로 확장합니다. 초기 탭은 개요와 플레이 기록입니다.
- 게시판에서 사용자 이름을 클릭하면 메뉴가 열립니다: 프로필 보기(공개 프로필일 때만), 차단(로그인했고 본인이 아닐 때).
- 문구는 ko·ja·en 메시지 카탈로그에 넣습니다. 네임스페이스: home, profile, settings, social, board, navigation.

## 구현 후 확정 사항

- 계정 전환 동기화(QueryClient.clear, router.refresh, identity-transition gate 종료)는 (shell) 레이아웃의 ViewerIdentitySync 한 곳에서 처리합니다. 페이지 위젯은 src/entities/auth/use-viewer-identity.ts의 useViewerIdentity로 정렬 여부만 읽습니다.
- 내비게이션 활성 판정은 / 만 정확 일치, 나머지는 접두 일치입니다. labelKey는 navigation 네임스페이스 안의 키입니다.
- 없는 글과 없는·비공개 프로필은 페이지 안의 안내 화면으로 표시합니다(상태 코드 200). 형식이 틀린 id·핸들도 같습니다.
- 대문자 핸들은 소문자로 바꾸지 않고 검증 실패로 처리합니다. 최근 갱신 목록은 기록 갱신 시각이 없는 공개 사용자를 제외합니다. 비공개 프로필에 대한 언팔로우도 404입니다.
- 공지 삭제는 관리자만 할 수 있습니다. 차단한 작성자의 글도 주소로 직접 열면 보입니다(목록과 댓글에서만 숨김). 남용 제한은 공지와 관리자에게도 적용됩니다. total이 0이면 totalPages는 0입니다.
- 리치 텍스트 검증은 JSON 중첩 깊이 100 이하를 먼저 확인하고, 표시용 attrs(link의 target·rel·class, codeBlock language 등)는 안전값으로 정규화합니다. 붙여넣은 HTML의 외부 이미지는 에디터가 제거합니다.
- 클라이언트 요청 헬퍼는 서버 오류 code를 Error의 cause로 전달합니다(getApiErrorCode). 화면은 code를 번역 키로 바꿔 표시하고 서버의 한국어 메시지를 직접 쓰지 않습니다.
- 페이지별 문서 제목은 레이아웃의 title template("%s | IIDX Rank")과 각 페이지의 generateMetadata로 정합니다.
- /api/users는 connection()으로 요청 시점 실행을 고정했습니다. 파일 조회 핸들러는 R2 오류 응답의 본문을 cancel하지 않고 소진합니다(docs/bug/2026-10-06-community-rollout.md).

## UI/UX 결정 반영 후 확정 사항 (2026-10-06)

- 주소에 반영하는 상태: 게시판 목록 ?page=, 댓글 페이지 /board/<id>?comments=<N>(1페이지는 생략), 사용자 페이지 탭 /u/<핸들>?tab=<탭 id>(기본 탭은 생략). 댓글 페이지와 탭 전환은 history API로 쿼리만 바꿔 서버 재요청과 스크롤 이동이 없습니다.
- 스크롤 표시: 네이티브 스크롤바는 전역으로 숨기고 src/shared/ui/scroll-indicator.tsx의 얇은 표시 막대를 씁니다. 모바일 문서 스크롤은 셸의 창 표시, 데스크톱의 본문·사이드바·다이얼로그 본문은 src/shared/ui/scroll-container.tsx(ScrollContainer)로 감쌉니다. 새 본문 스크롤 영역을 만들 때는 ScrollContainer를 사용합니다.
- 오류 화면: 페이지 오류는 (shell)/error.tsx가 셸 안에서 표시하고, 레이아웃 수준 오류는 [locale]/error.tsx가 표시합니다. 매칭되지 않는 주소는 src/app/global-not-found.tsx가 HTTP 404와 noindex로 응답하며 서버 HTML에는 ko·ja·en 안내를 함께 싣고 하이드레이션 뒤 주소 접두의 언어만 보여 줍니다(next.config.ts의 experimental.globalNotFound).
- 폼의 실패 안내: 인라인 오류 자리가 있는 폼(글 작성·수정, 댓글, 프로필 설정)은 인라인으로만 표시하고 같은 문장의 toast를 띄우지 않습니다. 폼이 아닌 동작(삭제, 차단, 팔로우, 램프 저장)과 인라인 자리가 없는 실패(이미지 업로드)는 toast를 씁니다.
- 미저장 경고: 프로필 설정과 게시글 편집기는 변경 후 저장 전이면 탭 닫기·새로고침에 경고합니다(src/shared/hooks/use-unsaved-changes-warning.ts). 게시글 편집기의 취소 버튼은 확인 창을 거칩니다. 사이트 안의 다른 링크 이동은 가로채지 않습니다.
- 리치 텍스트 표시: 저장 스키마의 제목 단계(2·3)는 유지하고 화면에서는 글 제목 아래 단계(h3·h4)로 그립니다. 에디터도 같은 태그로 그려 모양이 같습니다. 이미지에는 대체 텍스트를 넣을 수 있습니다(입력란 상한 200자).
- 터치 기기: 아이콘 버튼의 터치 영역을 가상 요소로 넓힙니다(단독 버튼 44x44, 한 줄에 붙은 툴바·페이지네이션 버튼은 이웃 가로채기를 피하려고 가로 36·세로 44, 에디터 툴바는 미적용). 난이도표는 처음 방문 시 길게 누르기 안내를 한 줄로 보여 주고 닫으면 브라우저에 기억합니다.
- 난이도표 툴바: 게이지(노멀/하드) 전환을 툴바에 두고, 필터 버튼에 적용된 필터 수를 표시하며 필터 창에서 초기화할 수 있습니다. 모션 감소 설정에서는 램프의 두 색을 위아래로 나눠 정적으로 표시하고 모든 램프 띠에 1px 경계선을 둡니다.

## SEO와 구조화 데이터

- 대표 주소는 src/shared/constants/site.ts의 SITE_URL(https://iidx.hyns.dev)입니다. canonical, hreflang, sitemap, JSON-LD의 url이 모두 이 값을 쓰고 로케일 접두 규칙(ko는 접두 없음, ja는 /ja, en은 /en)은 src/shared/lib/seo.ts의 헬퍼 한 곳에서 계산합니다.
- 색인 대상 페이지(홈, /table, /board, 글 상세, 공개 프로필)는 제목·설명·canonical·hreflang(ko·ja·en·x-default)·openGraph·twitter 카드를 가집니다. 글 상세의 문서 제목은 글 제목, 공개 프로필은 "닉네임 (@핸들)"입니다. 게시판 목록의 2페이지 이상은 자기 자신을 canonical로 합니다.
- 색인 제외(noindex): /settings, /board/new, /board/<id>/edit, 없는 글, 없거나 비공개인 프로필, 404. 이 경우 제목·설명에 사용자 정보를 넣지 않고 canonical·hreflang·JSON-LD도 내지 않습니다. 메타데이터와 sitemap은 비로그인 시점의 조회 결과만 사용합니다.
- src/app/robots.ts는 /api(파일 조회 /api/files 제외)와 색인 제외 경로를 차단하고 sitemap 위치를 알립니다. src/app/sitemap.ts는 정적 경로의 로케일 변형, 게시글, 공개 프로필을 싣습니다(비공개 프로필 제외).
- JSON-LD는 src/features/json-ld의 컴포넌트가 페이지별로 냅니다: 홈 WebSite, 난이도표 WebPage, 게시판 목록 CollectionPage와 ItemList, 글 상세 DiscussionForumPosting, 공개 프로필 ProfilePage와 Person, 홈을 뺀 색인 페이지에 BreadcrumbList. 값은 실제 데이터에서만 만들고 없는 값은 속성을 생략합니다.
- JSON-LD 주입은 설치본 Next 가이드(02-guides/json-ld.md)대로 script 태그에 dangerouslySetInnerHTML을 쓰되 JSON 직렬화 후 '<'를 이스케이프한 값만 넣습니다. 사용자 콘텐츠를 HTML로 주입하지 않는다는 보안 규칙의 예외는 이 한 곳(src/features/json-ld/json-ld.tsx)뿐입니다.

## 사용자 목록 페이지 (2026-10-06 변경)

- 사이드바의 최근 갱신 사용자 목록을 없애고 /users 페이지로 옮겼습니다. 공개 프로필 중 기록 갱신 시각이 있는 사용자를 최근 갱신순으로 20명씩 보여 주고 ?page= 로 넘깁니다.
- 페이지네이션 계산은 src/shared/lib/pagination.ts(PaginationSchema, createPagination)를 게시판과 함께 씁니다.
- /users는 색인 대상입니다(canonical·hreflang, CollectionPage와 BreadcrumbList JSON-LD, sitemap 포함). 목록에는 공개 프로필만 나옵니다.

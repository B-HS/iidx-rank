# 커뮤니티 기능 구현 계약

2026-10-06 사용자 결정에 따른 사용자 페이지·팔로우·최근 갱신 목록·게시판·차단·파일 저장의 구현 계약입니다. 기존 계약(docs/ARCHITECTURE.md, docs/CACHE.md)을 전제로 하며, 여기 적힌 이름·경로·형식은 작업자 간 공통 기준입니다.

## 결정

- 사용자 주소는 고유 핸들 /u/<핸들>. 프로필 공개 기본값은 비공개. 비공개 프로필은 본인만 봅니다.
- 프로필 사진과 게시판 본문 이미지는 Cloudflare R2에 저장합니다. 이미지 기능은 빼지 않습니다.
- 게시판은 글·댓글·본문 이미지, 공지는 관리자만 작성·수정·삭제하고 목록 상단에 고정합니다. 읽기는 누구나, 쓰기는 로그인 사용자.
- 차단은 차단한 사용자의 글·댓글을 숨기고 설정에서 해제합니다. 공지는 차단과 무관하게 표시합니다.
- 홈은 /, 난이도표는 /table. 대시보드 내용은 미정이라 빈 상태 화면입니다.
- DP 난이도표: 현재 원본 스프레드시트(☆12参考表)의 8개 탭은 모두 SP 전용이라 DP 원본이 없습니다. 사용자 결정으로 이번 범위에서 제외합니다.

## 라우트

모두 src/app/[locale]/(shell)/ 아래이며 (shell)/layout.tsx가 AppShell을 한 번만 렌더합니다.

| 경로 | 파일 | 내용 |
|---|---|---|
| / | (shell)/page.tsx | 홈 대시보드(빈 상태) |
| /table | (shell)/table/page.tsx | 기존 난이도표 |
| /u/[handle] | (shell)/u/[handle]/page.tsx | 사용자 페이지 |
| /settings | (shell)/settings/page.tsx | 프로필 설정·공개 범위·차단 목록 |
| /board | (shell)/board/page.tsx | 게시판 목록(?page=) |
| /board/new | (shell)/board/new/page.tsx | 글쓰기 |
| /board/[postId] | (shell)/board/[postId]/page.tsx | 글 상세·댓글 |
| /board/[postId]/edit | (shell)/board/[postId]/edit/page.tsx | 글 수정 |

cacheComponents 환경이므로 요청시간 데이터(세션·params·searchParams)는 Suspense 아래에서 읽습니다. 링크는 @shared/i18n/navigation의 Link를 사용합니다.

## 셸

- src/widgets/app-shell/app-shell.tsx가 사이드바와 본문 틀을 가집니다. 사이드바 순서: 홈, 난이도표, 페이지별 슬롯, 최근 갱신 사용자, 게시판, 하단(테마·계정).
- 내비게이션 항목은 src/widgets/app-shell/shell-nav.ts의 배열 SHELL_PRIMARY_NAV_ITEMS(홈·난이도표), SHELL_SECONDARY_NAV_ITEMS(게시판)에 추가합니다. 항목은 { href, labelKey, icon }이며 활성 판정은 경로 접두 일치입니다.
- 페이지별 사이드바 내용은 src/widgets/app-shell/shell-sidebar-portal.tsx의 ShellSidebarPortal로 슬롯에 그립니다. 페이지 위젯은 AppShell을 직접 감싸지 않습니다.
- 최근 갱신 사용자 목록은 src/widgets/recent-users/recent-users.tsx(RecentUsers)입니다.
- 계정 메뉴: 로그인 시 내 페이지·프로필 설정, 공통으로 언어 선택, 로그인/로그아웃. 난이도표의 표시 설정(로고·불투명도)은 /table 툴바의 버튼으로 엽니다.

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
- GET /api/users/recent → { users: [{ handle, name, avatarUrl, updatedAt }] }. 공개 프로필 중 기록 갱신 시각 내림차순 10명.

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

관리자 판정은 세션의 DB 역할(user.role === 'admin')입니다.

## 캐시·쿼리 키

- 프로필·게시판·차단 조회는 요청마다 DB에서 읽습니다. 최근 갱신 사용자만 'use cache' + RECENT_USERS_TAG('users:recent') + 60초 재검증을 쓰고, 기록 저장과 프로필 공개 설정·핸들·닉네임·사진 변경 시 태그를 만료합니다.
- QUERY_KEY: PROFILE { ALL, ME, DETAIL(handle), RECORDS(handle) }, USERS { ALL, RECENT }, BOARD { ALL, POSTS(params), POST(id), COMMENTS(postId, page) }, BLOCK { ALL, LIST }.
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
- /api/users/recent는 connection()으로 요청 시점 실행을 고정했습니다. 파일 조회 핸들러는 R2 오류 응답의 본문을 cancel하지 않고 소진합니다(docs/bug/2026-10-06-community-rollout.md).

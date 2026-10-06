# UI/UX 결정 16건 반영과 SEO·JSON-LD

사용자가 개별 서브에이전트 대신 Workflow 활용을 지시해 Workflow 도구로 실행했습니다. 1차 구현(셸 Opus, 난이도표 Opus, 게시판 Opus, 프로필 Sonnet) → 2차 구현(SEO·JSON-LD Opus, virtual-scroll Sonnet, 용어·toast Sonnet) → 통합 검증(Sonnet). main은 사전 조사(bblog의 virtual-scroll, 운영 도메인), 공용 파일 준비, 결과 확인, 셸 오류 화면의 스크롤 컨테이너 적용, 커밋을 맡았습니다.

## 결과

- 반영 내역과 남은 관찰: docs/quality-assurance/2026-10-06-ui-ux-audit.md의 "보고만 항목의 결정과 반영 결과"
- 계약: docs/COMMUNITY.md의 "UI/UX 결정 반영 후 확정 사항", "SEO와 구조화 데이터"
- 결정: docs/acknowledge/2026-10-06-ui-decisions-seo.md

## 검증

- typecheck 통과, lint 오류 0(기존 경고 4), 테스트 137 pass(22 파일), 메시지 3개 언어 361개 키 일치.
- 임시 SQLite 빌드 통과(정적 페이지 47, robots.txt와 sitemap.xml 포함).
- 로컬 서버: 주요 경로 200, 페이지별 title·description·canonical·hreflang, noindex 대상, JSON-LD 파싱(WebSite, WebPage, CollectionPage, DiscussionForumPosting, ProfilePage, BreadcrumbList), sitemap 93개 주소에 비공개 프로필 없음, 매칭되지 않는 주소 404.
- 브라우저(1280·390 폭): 가로 넘침 없음, main 1개·h1 1개·nav 랜드마크, 하단 테마·언어·로그인, 스크롤 표시 동작, 게이지 전환과 필터 버튼, 터치 안내. 콘솔은 로컬에서 예상되는 /_vercel 스크립트 404뿐.

## 커밋

fe0e728 feat(ui) UI/UX 결정 16건 반영, 4d30a16 feat(seo) 메타데이터·JSON-LD·robots·sitemap·전역 404.

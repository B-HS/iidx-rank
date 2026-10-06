# 커뮤니티 기능 배포 중 발견한 결함

## 홈에서 로그아웃하면 계정 메뉴가 스켈레톤에 멈춤

- 대상: src/widgets/app-shell/viewer-identity-sync.tsx, viewer-identity-boundary.tsx, src/app/[locale]/(shell)/layout.tsx, src/widgets/checker-workspace/checker-workspace.tsx
- 증상: 공용 셸 도입 후 / 에서 로그아웃하면 계정 메뉴가 풀리지 않았습니다. Production에 489a973부터 27a57a5 직전까지 있었습니다.
- 원인: 로그아웃이 identity-transition gate를 닫는데, gate를 열고 QueryClient.clear와 router.refresh를 하는 effect가 /table의 워크스페이스에만 있었습니다.
- 수정: 같은 effect를 (shell) 레이아웃 아래의 ViewerIdentitySync로 옮기고 서버 세션의 사용자 id는 Suspense 아래 ViewerIdentityBoundary가 읽습니다. 페이지별 중복 effect는 제거했습니다. 홈은 레이아웃의 세션 경계 때문에 정적에서 Partial Prerender로 바뀌었습니다.
- 검증: 로컬 서버와 브라우저에서 홈·/table·/settings·/board 각각 로그아웃 후 5초 안에 비로그인 메뉴로 돌아오고 재로그인 시 이름이 표시됨을 확인했습니다.

## 없는 파일을 조회하면 응답이 멈춤

- 대상: src/app/api/files/[...key]/route.ts
- 증상: 형식은 맞지만 R2에 없는 키로 GET /api/files/<키>를 호출하면 응답이 오지 않았습니다(Production 90초 이상, 로컬 30초 이상 무응답). 존재하는 파일과 형식이 틀린 키는 정상이었습니다.
- 원인: R2가 404를 돌려준 뒤 핸들러가 await upstream.body?.cancel()에서 끝나지 않았습니다. Next의 fetch 패치(node_modules/next/dist/server/lib/patch-fetch.js, clone-response.js)가 응답 본문을 tee로 분기하므로 한쪽 분기의 cancel은 다른 분기가 끝날 때까지 완료되지 않습니다. Next 밖에서 실행한 R2 왕복 스크립트에서는 드러나지 않았습니다.
- 수정: 오류 응답의 작은 본문을 cancel 대신 arrayBuffer()로 소진합니다.
- 검증: 수정 후 로컬 서버에서 같은 요청이 0.17초에 404 FILE_NOT_FOUND를 반환했습니다.
- 남은 확인: src/entities/catalog/catalog.storage.ts의 원본 수집에도 await response.body?.cancel()과 await reader.cancel()이 있습니다. 실패 경로에서만 실행되고 10초 AbortSignal이 걸려 있어 이번에는 바꾸지 않았습니다. docs/quality-assurance/2026-10-06-audit-deferred.md에 기록했습니다.

# 전체 감사와 결함 수정

사용자가 workflow 사용과 Fable 미사용을 명시했습니다. main은 Opus, 하위는 Opus(의미적 감사·까다로운 수정)와 Sonnet(범위가 분명한 수정·기계 검증)으로 배정했습니다.

## 진행

- 감사(병렬 3건, 읽기 전용): 서버·데이터·캐시·인증 계층(Opus), 클라이언트 상태·UI 계층(Opus), 기준 검증 typecheck·lint·test·메시지 키 정합·prettier(Sonnet).
- main이 각 발견을 실제 파일과 라이브러리 소스(better-auth session-atom, 설치본 Next 문서)로 재확인해 수정 10건, 문서 갱신, 보류 항목으로 분류했습니다.
- 수정(병렬 2건, 파일 소유권 분리): 기록 저장·세션 대기·테마·표시 설정·기록률(Opus), 오류 화면·로딩 스켈레톤·카드 키보드·수집 스크립트·typecheck 스크립트(Sonnet).
- 통합 검증(Sonnet 1건): typecheck, lint, test, build, 임시 SQLite의 upsertRecord 실행, 런타임 GET 확인.

## 결과

- 수정 내역과 검증 결과: docs/bug/2026-10-06-audit-fixes.md
- 보류 항목과 결정 필요 사항: docs/quality-assurance/2026-10-06-audit-deferred.md
- 계약 문서: docs/ARCHITECTURE.md에 scoreGrade, PATCH의 생략 = 보존 의미, 표시 설정 API와 캐시를 반영했습니다. docs/CACHE.md에 표시 설정 행과 정적 셸 catalog 캐시가 revision 없이 태그 만료·5분 재검증에 의존한다는 사실을 반영했습니다.

## 되돌린 변경

현지화 404를 위한 src/app/[locale]/[...rest]/page.tsx는 Cache Components에서 응답이 200 소프트 404가 되어 제거했습니다. 근거와 선택지는 보류 문서에 있습니다.

## 커밋

44e57a5 fix(checker) 메모·DJ 랭크 보존, 8b06c94 fix(checker) 기록률, b44f9db fix(auth) 비로그인 세션 재조회, 6033d63 fix(ui) 테마 아이콘, 3d738a9 fix(ui) 슬라이더 포커스, db8855f fix(ui) 오류 화면 재시도, 6e893a1 fix(ui) 로딩 스켈레톤, 9377201 fix(ui) 카드 키보드 입력, 8d76407 fix(scripts) DB 연결 종료, b46ae5b build typecheck.

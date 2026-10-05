# 스켈레톤과 접힌 사이드바 보완

2026-10-05 사용자 선택에 따라 main이 직접 수행했습니다.

## 수정

기존 CheckerLoading의 큰 사각형 두 개를 필터·원본 정보·개인 진행률·헤더·랭크와 곡 카드 구조의 shadcn Skeleton으로 교체했습니다. 실제 카드와 스켈레톤이 공유하는 grid 상수로 모바일 최소 3열을 유지합니다. 기존 페이지 Suspense와 loading.tsx 경계에서 사용합니다.

세션 확인·계정 전환·캐시 없는 개인 기록 조회 동안 진행률과 카드 램프를 스켈레톤으로 표시합니다. 이때 기록 편집·미플레이 필터 변경을 막고, 이미 선택된 미플레이 필터는 기록이 도착할 때까지 목록과 결과 수를 스켈레톤으로 표시합니다. 캐시가 있는 백그라운드 조회는 isPending이 아니므로 기존 램프·진행률·필터 결과를 유지합니다. 원본 수집·DB 조회·사용자 캐시 키는 변경하지 않았습니다.

접힌 SidebarMenuButton의 기본 32px 너비를 레일 전체 48px로 맞추고 아이콘을 중앙 정렬했습니다. 접힌 footer는 96px 높이의 1열이며 테마와 로그인/계정 버튼은 각각 48×48px입니다. 펼침과 모바일 drawer에서는 기존 2열·48px 높이를 유지합니다. 공통 shadcn Sidebar 구현은 변경하지 않았습니다.

## 검증

환경 파일 없는 임시 복사본의 Next build·TypeScript·PPR 생성이 성공했습니다. 상세 UI 관찰은 docs/quality-assurance/loading-and-sidebar.md에 기록했습니다. 테스트 전용 경로와 fixture API는 임시 복사본에서만 사용하고 빌드 전에 실제 소스로 복원했습니다. 최종 빌드 경로 목록에는 테스트 페이지가 없습니다.

헤더 태그 수정 중 구문 오류와 임시 개발용 생성 타입의 삭제된 경로 참조로 두 번 빌드가 실패했습니다. 각각 닫힘 태그 수정과 생성 타입의 복구 가능한 임시 이동 후 빌드가 성공했습니다. 강제 삭제는 자동 승인 검토가 차단하여 실행하지 않았습니다.

공식 문서: https://nextjs.org/docs/app/api-reference/file-conventions/loading · https://tanstack.com/query/latest/docs/framework/react/guides/background-fetching-indicators

Production 반영 확인은 배포 완료 후 기록합니다.

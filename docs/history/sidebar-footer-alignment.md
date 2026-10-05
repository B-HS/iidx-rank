# 사이드바 하단 버튼 정렬

2026-10-05 사용자 화면 지적을 반영했습니다. 이번 작업은 main이 직접 수행했습니다.

## 원인과 수정

기존 footer는 가로 flex의 두 동일 폭 버튼 안에서 콘텐츠를 왼쪽에 정렬했습니다. 문구 길이가 달라 각각의 아이콘·텍스트 묶음 중심이 각 칸 중심과 일치하지 않았습니다. 기본 h-8 버튼과 계정 로딩 h-9도 높이가 달랐습니다.

src/widgets/app-shell/app-shell.tsx에서 footer를 같은 폭 grid 2열로 만들고 버튼 높이를 footer 전체 48px에 맞췄습니다. 테마·로그인·계정·로딩 상태 모두 중앙 정렬을 적용했습니다. 접힌 상태는 24px 버튼 중앙에 아이콘만 남기고 aria-label로 접근성 이름을 유지합니다. 공유 shadcn Sidebar 기본 컴포넌트는 수정하지 않았습니다.

## 확인

- 환경 파일 없는 임시 복사본 Next build·타입 검사 성공. 변경 파일 Prettier unchanged, diff 검사 성공.
- 데스크톱 펼침: 각 버튼 128×48px. 아이콘·텍스트 묶음 가로 중심 64/192px, 아이콘과 텍스트 세로 중심 모두 696px.
- 데스크톱 접힘: 각 버튼 24×24px, 아이콘 중심과 버튼 중심 일치.
- 모바일 drawer: 버튼 폭 동일, 높이 48px, 아이콘과 텍스트 세로 중심 820px로 일치.
- 구현 commit 8073ca3이 GitHub main에 반영됐고 Production 배포 https://iidx-rank-fa54qagst-b-hs-projects.vercel.app가 READY입니다. https://iidx-rank.vercel.app에서 두 버튼 폭 약128px·높이 약48px·아이콘/문구 중심 일치를 확인했습니다. 접힌 상태에서도 테마 전환·로그인 접근성 이름을 확인했습니다. 운영 계정 이름·로딩 상태는 같은 공통 클래스 적용을 코드에서 확인했으며 별도 계정 생성은 하지 않았습니다.

운영 캡처 iidx-rank-footer-aligned.png를 저장했습니다. 검증용 viewport는 복구했습니다.

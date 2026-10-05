# 난이도표 화면 밀도

## 대상 파일

src/widgets/app-shell/app-shell.tsx, src/widgets/checker-workspace/checker-workspace.tsx, src/features/chart-card-grid/chart-card-grid.tsx

## 리포트

사용자는 좌측 사이드바와 콘텐츠 패딩을 제거하고, 우측 패널을 좌측으로 통합하며, 한 곡 한 행의 표를 모바일 최소 3열 카드로 바꾸도록 요청했습니다.

## 상세

초기 화면은 디자인 문서의 3단 구조와 패딩을 적용해 콘텐츠 폭이 줄었고, 목록이 한 곡 한 행이어서 전체 난이도표를 빠르게 훑기 어려웠습니다. 최신 사용자 요구를 우선하여 2단 구조와 패딩 없는 외곽, 좁고 많은 카드를 사용합니다. 필터와 원본 상태는 좌측에 통합하고 전체 곡명과 기록 편집은 카드 상세에 둡니다.

이 결정은 많은 곡을 비교하는 난이도표 화면에 적용합니다. 모든 제품 화면에 무조건 3열 카드를 요구하는 보편 규칙으로 확장하지 않습니다. 검증 결과는 docs/quality-assurance/implementation.md에 기록합니다.

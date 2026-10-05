# 모바일 문서 스크롤·랭크 sticky

## 대상

src/app/[locale]/layout.tsx, src/app/globals.css, AppShell, CheckerWorkspace/Loading, ChartRankSection/Skeleton

## 원인과 수정

모바일에서도 body 높이를 100dvh로 고정하고 overflow:hidden을 적용했습니다. AppShell·콘텐츠까지 overflow:hidden을 중첩하고 곡 목록만 overflow:auto로 처리하여 Safari가 사용하는 문서 스크롤 위치는 변하지 않았습니다. 운영 화면 390×844에서 문서 높이/clientHeight 모두 844px, 내부 목록 10,702px/clientHeight 796px였으며 스크롤 입력 후 문서 scrollTop 0, 목록 scrollTop 950으로 재현했습니다.

모바일에서는 문서 높이 고정과 내부 목록 overflow를 해제합니다. md 이상은 기존 화면 고정·내부 목록 스크롤을 유지합니다. Safari 상태 표시줄 제스처를 JS로 가로채지 않습니다.

모바일 콘텐츠 헤더는 top:0, 랭크 헤더는 기존 48px 콘텐츠 헤더 아래에 sticky로 표시합니다. 데스크톱 랭크 헤더는 목록 영역 top:0에 고정합니다. 다음 랭크가 올라오면 이전 랭크의 section 경계에서 자연스럽게 교체됩니다. 기본 shadcn Card의 overflow:hidden은 랭크를 감싸는 Card에 한해 overflow:visible로 재정의합니다. 카드·모달의 다른 overflow 처리는 유지합니다. 공통 CSS를 로딩과 실제 화면에 함께 적용합니다.

근거: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position 및 설치된 Next CSS 가이드.

## 검증

- 분리 환경 bun run build 성공: Cache Components·React Compiler, ko/ja/en Partial Prerender 및 API 계약 유지.
- 변경 TSX 6개 ESLint 성공, 변경 CSS/TSX 7개 Prettier 확인(한 파일 포맷 수정 후 관련 검사 재실행), git diff --check 성공.
- 모바일 390×844: 문서 높이 10,750px, 목록 clientHeight/scrollHeight 10,702px로 내부 스크롤 없음, document scrollTop 5,224px 확인. 3열 각130px, 가로 넘침0. 콘텐츠 헤더 top0, 현재 B 랭크 top48.
- S+부터 F까지 10개 랭크의 sticky 위치를 각 section 경계와 스크롤 최대값을 고려해 계산한 기대값과 비교: 오차0. 마지막 짧은 구간은 문서 끝에서 최대 스크롤에 도달하므로 원래 위치에 보이며 추가 빈 여백을 만들지 않습니다.
- 스크롤 중 B 랭크 접기 aria-expanded=false와 헤더 top48, 다시 열기 true 확인. 필터 모달 열 때 body overflow:hidden·z50, 닫기 후 overflow:visible·스크롤 위치3,982px 유지 확인.
- 데스크톱 1280×844: 문서 높이844/clientHeight844, documentTop0, 내부 목록796px/6,082px, 사이드바256px, 가로 넘침0. 모든 랭크의 sticky 기대 위치 오차0.
- Chrome 기반 브라우저에서 문서 스크롤 구조·sticky·모달을 검증했습니다. 실제 iPhone Safari의 OS 상태 표시줄 탭은 이 실행 환경에서 직접 자동화하지 못했습니다. 실기기에서 표 중간까지 이동 후 상태 표시줄 탭으로 첫 랭크 복귀 및 필터 닫기 후 재시도하는 확인이 남아 있습니다.

## 운영

GitHub main 및 Production 배포 결과는 배포 확인 후 기록합니다.

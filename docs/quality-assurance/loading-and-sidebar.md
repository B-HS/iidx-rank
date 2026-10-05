# 스켈레톤·사이드바 검증

2026-10-05 main 직접 검증. 실제 환경 파일을 복사하지 않은 임시 프로젝트와 로컬 SQLite를 사용했습니다.

- 초기 로딩: 실제 CheckerLoading을 임시 경로에서 렌더링하여 필터·헤더·랭크 3개·곡 카드 Skeleton을 확인했습니다.
- 모바일 390×844: 스켈레톤과 실제 카드 모두 3열, document scrollWidth 390px로 가로 넘침이 없습니다. 필터 drawer에서도 Skeleton이 표시됩니다.
- 개인 기록 캐시 없음: 임시 세션 fixture와 catalog만 hydrate한 실제 CheckerWorkspace에서 records GET을 파일 gate로 지연했습니다. 666개 곡의 제목은 유지되고 램프 Skeleton·버튼 disabled·진행률 Skeleton이 표시됐습니다. 실제 progressbar는 표시되지 않았습니다.
- 기록 도착: 로컬 fixture 기록 1개가 반영되어 1/666 진행 표시, 미플레이 필터는 665/666 결과가 됐습니다. 백그라운드 재조회 GET을 다시 지연했을 때 결과 665개와 기존 진행률이 유지되고 Skeleton 0개, 조회 버튼 aria-busy=true였습니다.
- 접힘: 레일·메뉴 모두 폭 48px, 메뉴 높이 36px, 아이콘 중앙 x=24px입니다. 하단 테마·계정 버튼 각각 48×48px, 같은 x=24px, 세로 중심 간격 48px입니다.
- 펼침: footer 버튼 각각 128×48px로 같은 높이·폭입니다. 모바일 drawer에서도 동일 폭 2열·48px 높이를 유지했습니다.
- 실제 소스 복원 후 bun run build 성공, TypeScript 성공, 홈 PPR 유지. git diff --check 성공. 기존에 기록된 운영 hydration 경고는 이번 변경 범위에 포함하지 않았습니다.

계정 전환의 기존 인가·캐시 게이트는 유지하고 pending 표시를 연결했습니다. 새 실계정 생성 및 운영 개인 데이터 변경은 하지 않았습니다. 임시 테스트 API·경로는 저장소에 포함되지 않습니다.

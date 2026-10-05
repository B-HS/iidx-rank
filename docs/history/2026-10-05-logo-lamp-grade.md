# 로고·램프·DJ 랭크·격자 변경

## 대상 파일과 결과

- entities/catalog/catalog-series.ts: 사용자 제공 public/iidx-logo의 1~34번 파일을 실제 버전에 매핑했습니다. 현재 카탈로그의 29개 버전이 모두 대응하며, 모르는 버전은 텍스트로 표시합니다.
- entities/preferences 및 api/preferences/display: 로고/시리즈명과 0~100% 불투명도(기본 70%)를 인증 사용자의 DB에 저장합니다. UUID와 revision을 서버 캐시 키에 넣고 사용자별 태그를 변경 직후 만료시킵니다. TanStack Query의 같은 UUID 키를 무효화하고 서버 첫 화면 prefetch에 포함합니다. 비로그인 설정은 현재 화면에서만 유지합니다.
- features/chart-card-grid/chart-card.tsx: 일반 클릭으로 노멀 NO_PLAY→EASY→CLEAR→NO_PLAY, 하드 NO_PLAY/EASY/CLEAR→HARD→EX_HARD→NO_PLAY를 적용합니다. 550ms 길게 누름과 Shift+Enter는 상세 창을 엽니다. 이동 10px 초과 시 터치를 취소하며 길게 누름 후 클릭은 억제합니다.
- checker 기록: score_grade nullable 컬럼에 F~AAA를 저장하고 카드 하단에 작게 표시합니다. 빠른 램프 변경은 기존 DJ 랭크·메모를 보존하며, 옛 클라이언트가 scoreGrade를 생략해도 기존 값은 지우지 않습니다.
- 카드 격자: 반응형 3~7열에서 마지막 행을 빈 셀로 채워 테두리를 이어갑니다. 난이도 A 빨강/L 보라/H 노랑, 램프 5px, 미플레이 회색, EASY 초록/검정·CLEAR 노랑/검정·HARD 흰색/검정·EX HARD 빨강/노랑 점멸을 적용했습니다. 모션 감소 설정은 정적인 색으로 표시합니다.

## 색상 근거와 범위

Konami 공식 안내 https://p.eagate.573.jp/game/2dx/26/howto/epass/play_data.html 의 HYPER 노랑·ANOTHER 빨강과 clear 상태 안내를 확인했습니다. 공식 웹 아이콘의 픽셀 RGB는 게임 화면의 색상 토큰으로 규정되어 있지 않습니다. HEX는 공개 공식 규격으로 주장하지 않으며 UI 상수에서 밝은 빨강 #ff0000, 보라 #b000ff, 초록 #00ff00, 노랑 #ffff00을 사용했습니다. 게임의 CLEAR 표시색은 난이도별로 다르지만, 이 체커의 CLEAR는 사용자 요청대로 노랑/검정입니다.

## 계정 유지보수

scripts/seed-admins.ts는 기존 사용자 역할만 지정하고 계정을 만들지 않습니다. 사용자가 삭제 대상으로 지정한 이메일은 hs@gumyo.net입니다. scripts/reset-user.ts는 exact 이메일 조회, 기본 audit, 명시적인 delete일 때만 트랜잭션으로 해당 사용자·세션·인증 계정·기록·설정·revision·이메일 검증을 지웁니다. 다른 사용자는 조회/수정하지 않습니다. 로컬 임시 DB 검증에서 삭제 대상 remaining 0 및 별도 계정 보존을 확인했습니다. 운영 삭제 결과는 배포 완료 후 별도 기록합니다.

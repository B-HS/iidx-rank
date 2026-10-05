# 로고·램프·DJ 랭크 검증

## 완료

- [x] .env 없는 검증 복사본에서 migration 생성 및 임시 SQLite 적용, Next build와 TypeScript 통과. 홈 PPR 및 모든 API 동적 경로 유지.
- [x] 실제 better-auth와 Next API를 사용한 임시 계정 2개의 33 assertions 모두 통과: 비인증 401, 출처 403, 범위/타입/사용자 UUID 주입 400, MIME 415, 사용자 설정/기록 분리, 즉시 재조회, 이전 클라이언트 grade 보존, 잘못된 grade 거절 및 명시적인 null 삭제.
- [x] 실제 화면에서 노멀 EASY→CLEAR→NO_PLAY 및 하드 HARD→EX_HARD→NO_PLAY 확인. AAA 유지, 상세 모달 F~AAA 옵션 및 F 저장 확인.
- [x] 길게 누름으로 Beyond Evolution 모달 열림, 램프는 미플레이 유지. Shift+Enter 상세 창과 기존 메모 유지 확인.
- [x] 로고/시리즈명 전환, 불투명도 0·70·100%, 새로고침 후 설정 유지 확인. 실제 로고 opacity 0.7.
- [x] 모바일 390px: document width 390px, 3열, 19개→빈칸 2개로 21셀·7개→빈칸 2개로 9셀. 데스크톱 1280px: 6열·19개→24셀, 7개→12셀.
- [x] ANOTHER rgb(255,0,0), LEGGENDARIA rgb(176,0,255)의 1px 전체 테두리와 HARD 램프 5px·점멸 애니메이션 확인. 다크 테마 화면 저장.
- [x] 임시 SQLite에서 한 계정 삭제 remaining 0, 두 번째 계정 audit matches 1 확인 후 검증 계정 정리.

## 운영 확인 대기

- [ ] Production migration 및 홈/새 API/로고 파일 응답 확인.
- [ ] 사용자 지정 계정 삭제 cloud 실행 remaining 0 확인.

## 검증 범위

실제 Konami 기기의 개별 화면 픽셀과 완전 동일한 HEX는 공개 명세가 없어 검증하지 않았습니다. 모든 실제 모바일 OS의 터치/컨텍스트 메뉴 차이는 출시 후 기기 검증 대상으로 남습니다. 기존 날짜 표시의 React hydration 경고는 이번 변경 범위 밖입니다. 검사 스크립트와 임시 계정은 운영에 배포하지 않습니다.

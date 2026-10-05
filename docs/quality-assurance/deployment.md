# 배포·역할·수집·화면 검증

## 실행 완료

- [x] 기존 .env·node_modules 없는 임시 복사본 frozen install: 722 packages. Next.js 16.3.8 build 성공, Cache Components 활성화, 홈 PPR·API 동적 경로 유지.
- [x] 수정 버전 typecheck 성공. 변경 ESLint 오류 0, 기존 cache generation 인자 경고 1. 변경 Prettier 및 diff 검사 성공.
- [x] 임시 SQLite migration 후 666개 묶음 upsert. 기존 곡 비활성화 이후 개인 기록 보존, 반복 DB 조회 fetch 0회, 수집 실패 시 정상 snapshot 유지.
- [x] 임시 HTTP 서버: 역할 위조 가입은 user, 역할 변경은 400, 일반 사용자 갱신 403, 관리자 갱신 200. Cron Secret 없음·오류 401, 올바른 Secret 200. catalog 반복 조회 시 fetchedAt 유지.
- [x] 실제 DOM: 노멀·하드 기준 지력/개인차 분리, S+→F 랭크 섹션. 冥은 노멀 A / 하드 S+. 정렬 필터 제거. 헤더 좌우·필터 내부 12px, 콘텐츠 외곽 0px.
- [x] 데스크톱 1280px와 모바일 390px document width 동일. 모바일 grid 3열. screenshots: iidx-rank-rank-sections-desktop.png, iidx-rank-rank-sections-mobile.png.

## Production 확인 완료

- [x] 수정 commit 자동 Production 배포 READY, role migration·seed build 로그 확인.
- [x] catalog 666개 및 수집시각 유지, 개인 API·관리자 수집·Cron 미인증 차단 확인.
- [x] Vercel Cron 등록과 native 수동 실행 확인.
- [x] Production 화면·배포 결과 기록.

## 운영 검증 부채

- 다음 예약 일일 실행 시각의 실제 실행 로그는 아직 관찰하지 않았습니다. 예약 배포·수동 실행과 실제 다음 예약 실행은 구분합니다.
- 여러 인스턴스에서 동시에 수집 요청하는 고부하 경합과 플랫폼 장애 복구는 이번 변경에서 재현하지 않았습니다. DB 조건부 잠금·revision을 사용하며 인스턴스 확장 또는 실패 보고 시 검증합니다.
- Next Route Handler maxDuration은 프레임워크 정적 분석 계약상 숫자 리터럴 60을 export합니다. 일반 도메인 타이밍 상수와 구분합니다.

## 운영 실행 근거

구현 commit: 7f7166c. GitHub main push가 Vercel Production 배포 dpl_2S3v9tfrXLiG3vWRvRUdXweZ37NW를 생성했으며 READY입니다. inspect --logs에서 migration·seed·build 순서와 성공을 확인했습니다.

- 사이트: https://iidx-rank.vercel.app
- 배포: https://iidx-rank-bd4i0uut1-b-hs-projects.vercel.app
- crons list: /api/catalog/sync, 0 18 * * *. crons run: 2026-10-05T10:22:45.819Z 실행. logs --status-code 200 --query /api/catalog/sync에서 해당 GET 1건 확인. 당일 수집 데이터가 있으므로 중복 수집을 생략했습니다.
- 운영 HTTP: catalog 200·666개, fetchedAt 2026-10-05T10:17:54.726Z 유지. records GET/PATCH, catalog/sync POST 및 미인증 GET 401. session 200/null, private,no-store. 전체 첫 조회와 병렬 권한 확인까지 2772ms였으며 단일 쿼리 시간으로 해석하지 않습니다.
- 운영 DOM: S+부터 F까지 노멀 랭크 섹션, 정렬 UI 없음·미인증 원본 갱신 버튼 없음, desktop 1280px와 mobile 390px에서 가로 넘침 없음. 모바일 grid 129.328px 3열. 운영 캡처 iidx-rank-production-ranks.png, iidx-rank-production-mobile.png 저장.

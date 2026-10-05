# Production·일일 수집·역할·랭크 표시 반영

2026-10-05 작업입니다. 사용자가 이번 배포 작업의 workflow를 사용하지 않음을 선택하여 main이 직접 수행했습니다.

## 반영

- GitHub B-HS/iidx-rank main과 Vercel iidx-rank를 연결하고 Production만 자동 배포합니다. 6개 환경변수는 Production sensitive로 등록했습니다. local .env 수정과 값 출력 없이 진행했습니다.
- 페이지·catalog GET의 5분마다 원본 수집을 제거하고 DB만 조회합니다. 하루 1회 Cron과 DB admin 역할 사용자만 수동 수집을 수행합니다. 일반 user가 갱신하는 경로는 차단했습니다.
- 사용자 승인에 따라 이메일 Secret으로 초기 관리자 두 계정을 지정하고 DB role admin/user를 추가했습니다. role 입력을 서버 소유로 두어 클라이언트 위조를 차단합니다.
- 원격 DB 순차 666회 upsert를 111개 단위 묶음으로 줄이고 원자적 저장·기록 보존을 유지합니다.
- 헤더와 필터 내부 12px padding을 복구하고 콘텐츠 외곽 0px을 유지했습니다. 노멀·하드 선택에 따라 S+부터 F까지 지력·개인차 랭크 섹션을 표시하며 정렬 필터를 제거했습니다. 모바일 최소 3열입니다.

## 검증과 한계

새 설치 빌드·타입 검사, DB 원자성·기록 보존, 역할 위조·일반 사용자 차단·관리자 수집·Cron 인증, 실제 Production 666개·미인증 401·모바일 3열을 확인했습니다. GitHub 자동 배포 READY와 원격 migration·seed 실행을 확인했습니다. 예약 등록 및 native 수동 GET 200을 확인했으며 다음 예약 실행 시각의 실제 로그 관찰과 고부하 다중 인스턴스 경합은 운영 검증 부채로 남깁니다.

구현 commit 7f7166c, 상세 근거 docs/quality-assurance/deployment.md, 사이트 https://iidx-rank.vercel.app.

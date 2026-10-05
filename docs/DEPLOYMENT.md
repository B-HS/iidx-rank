# Production 배포

## 대상과 정책

사이트: https://iidx-rank.vercel.app

GitHub: https://github.com/B-HS/iidx-rank.git

Vercel b-hs-projects/iidx-rank 프로젝트를 GitHub에 연결했습니다. Production 브랜치는 main입니다. vercel.json의 git.deploymentEnabled는 전체 브랜치 false, main만 true이며 CLI 배포는 --prod만 사용합니다. Preview 배포는 생성하지 않았습니다.

## 환경변수

DATABASE_URL, TURSO_AUTH_TOKEN, BETTER_AUTH_URL, BETTER_AUTH_SECRET, ADMIN_BOOTSTRAP_EMAILS, CRON_SECRET을 Production sensitive 환경변수로 등록했습니다. Preview·Development에는 등록하지 않습니다. 값은 저장소와 문서에 넣지 않습니다.

제공된 turso: 주소는 동일 호스트의 libsql: 형식으로 Production에 등록했습니다. BETTER_AUTH_URL은 실제 Production origin인 https://iidx-rank.vercel.app로 설정했습니다. 로컬 .env는 수정하지 않았습니다. 관리자 초기 이메일 지정은 사용자가 허용한 두 계정을 Secret에서 설정하고, 서버 인가는 DB의 admin/user 역할을 확인합니다.

## DB와 원본 수집

로컬은 SQLite, Production은 Turso입니다. 배포 빌드는 bun run db:migrate → bun run db:seed-admins → bun run build 순서로 수행합니다. Drizzle의 생성된 migration으로 role 컬럼을 추가하며 기존 데이터는 유지합니다. seed는 초기 지정 계정만 admin으로 갱신합니다.

페이지와 catalog GET은 DB만 조회합니다. Vercel Cron은 /api/catalog/sync를 0 18 * * * UTC로 하루 1회 호출합니다. 한국·일본 시간 03시이며 Hobby에서는 해당 시간대 내 실행될 수 있습니다. CRON_SECRET Bearer 인증이 필요하고 UTC 당일 이미 수집했다면 재수집을 생략합니다. 관리자의 수동 POST는 같은 출처·세션·DB 역할 검사와 60초 쿨다운을 적용합니다.

666개 패턴은 파싱 검증 후 111개 단위의 Drizzle upsert와 원자적 트랜잭션으로 저장합니다. 수집 실패 시 기존 목록과 개인 기록을 보존합니다.

## 검증

새 설치 frozen install·Next build, 역할·Cron 인증·DB 보존·모바일 3열 검증을 완료했습니다. 수정 구현 commit 7f7166c의 GitHub 자동 Production 배포가 READY이며 migration·seed·build 성공을 확인했습니다. catalog 200/666개, 비인증 보호 API 401과 운영 모바일 3열을 확인했습니다. Vercel Cron native 수동 실행의 GET 200 로그를 확인했습니다. 상세 결과는 docs/quality-assurance/deployment.md에 기록했습니다. 자동 일일 실행의 다음 실제 시각 관찰은 별도 운영 항목입니다.

## 공식 근거

- https://vercel.com/docs/project-configuration/git-configuration
- https://vercel.com/docs/cli/env
- https://vercel.com/docs/cron-jobs/manage-cron-jobs
- https://tursodatabase.github.io/libsql-client-ts/
- https://orm.drizzle.team/docs/guides/upsert
- https://better-auth.com/docs/concepts/database

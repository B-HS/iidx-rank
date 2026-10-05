# Production 배포

## 대상과 정책

GitHub: https://github.com/B-HS/iidx-rank.git

Vercel 프로젝트 이름은 iidx-rank로 설정합니다. Production 브랜치는 main입니다. vercel.json의 git.deploymentEnabled에서 전체 브랜치는 false, main만 true로 설정하여 Preview 자동 배포를 막습니다. CLI 배포도 --prod만 사용합니다.

## 환경변수

.env 값은 GitHub에 올리지 않습니다. Vercel Production 환경에 sensitive로 등록하여 대시보드에서 값을 다시 읽을 수 없도록 합니다. Preview와 Development에는 등록하지 않습니다. DATABASE_URL, TURSO_AUTH_TOKEN, BETTER_AUTH_URL, BETTER_AUTH_SECRET을 사용합니다.

현재 libSQL 드라이버는 turso: 프로토콜을 지원하지 않습니다. 제공된 .turso.io 주소는 동일 호스트의 libsql: 형식으로 연결 검증했고, Production에는 지원되는 libsql: 형식으로 등록합니다. 로컬 .env 파일은 수정하지 않습니다.

## DB와 검증

로컬 SQLite는 개발용으로 유지합니다. Production에는 제공된 원격 Turso DB를 사용하며, Drizzle migrate로 테이블을 준비하고 공개 Google Sheets HTML을 수집합니다. 사용자 데이터가 있는 테이블을 삭제하거나 초기화하지 않습니다. 최종 배포 URL과 검증 결과는 배포 완료 후 기록합니다.

## 공식 근거

- https://vercel.com/docs/project-configuration/git-configuration
- https://vercel.com/docs/cli/env
- https://vercel.com/docs/projects/deploy-from-cli
- https://tursodatabase.github.io/libsql-client-ts/

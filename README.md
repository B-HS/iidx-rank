# IIDX Rank

Google Sheets 공개 HTML의 ☆12 SP 난이도표를 읽고, 사용자별 클리어 램프와 메모를 저장하는 Next.js 앱입니다. 원본의 노마게·하드 랭크와 빨간색 개인차 표시를 함께 수집합니다.

## 로컬 실행

Bun을 사용합니다. 프로젝트 루트에서 실행하세요.

```sh
bun install --frozen-lockfile
bun run db:migrate
bun run source:sync
bun run dev
```

공개 난이도표는 인증 설정 없이 조회할 수 있습니다. 회원가입·로그인·개인 기록에는 `BETTER_AUTH_SECRET` 환경변수가 필요합니다. 본인이 32자 이상의 무작위 값을 만들어 실행 환경에 설정하세요. `.env.example`에는 변수 이름만 있습니다. Next에서는 `.env.local`을 사용할 수 있으며 Bun 스크립트는 같은 DB 환경변수를 전달받아야 합니다.

| 변수               | 생략 시 동작                     |
| ------------------ | -------------------------------- |
| DATABASE_URL       | file:./data/iidx.db              |
| BETTER_AUTH_URL    | http://localhost:3000            |
| BETTER_AUTH_SECRET | 공개 조회만 가능, 인증 설정 필요 |
| TURSO_AUTH_TOKEN   | 로컬 SQLite에서는 불필요         |

다른 포트나 도메인에서 실행할 때는 `BETTER_AUTH_URL`을 실제 주소와 맞추세요. SQLite 파일과 인증 시크릿은 버전 관리에 포함하지 않습니다. `bun run build` 후 `bun run start`로 프로덕션 모드를 실행할 수 있습니다.

## 데이터와 캐시

- 일반·하드 표와 안내 HTML을 검증하고 하나의 트랜잭션으로 저장합니다. 파싱 실패 시 마지막 정상 데이터를 유지합니다.
- 실행 중 요청 시 수집시각을 확인하며, 5분 이후 원본을 다시 확인합니다. 인증 사용자에게 수동 동기화도 제공합니다. Google Sheets가 게시한 내용이 최신성의 기준입니다.
- Next Cache Components/PPR와 `use cache`, TanStack Query 서버 프리페치를 사용합니다. 개인 기록 캐시에는 사용자 UUID와 기록 revision이 포함됩니다.
- 기록 저장과 개인 캐시 갱신 API는 서버 세션의 사용자에게만 적용됩니다. 계정 변경 시 클라이언트 캐시를 비웁니다.

## 화면

좌측 사이드바에 필터·원본 갱신 정보·기록 요약을 통합하고 콘텐츠와 함께 2단으로 표시합니다. 외곽 패딩을 제거한 카드 그리드는 모바일에서도 최소 3열을 유지합니다. 카드 상세에서 전체 곡명·개인차와 램프·메모를 확인하고 편집합니다. 모바일에서는 좌측 메뉴 버튼으로 필터를 엽니다.

## 문서

- [캐시와 갱신 계약](docs/CACHE.md)
- [데이터와 API 계약](docs/ARCHITECTURE.md)
- [디자인 기준](docs/DESIGN.md)
- [e-amusement 향후 연동 계획](docs/E-AMUSEMENT.md)
- [Production 배포](docs/DEPLOYMENT.md)
- [작업 상태](docs/PROCESS.md)
- [검증 결과](docs/quality-assurance/implementation.md)

e-amusement 실제 연동은 아직 구현하지 않았습니다. 로컬 개발은 SQLite를 사용하고, Production 배포는 docs/DEPLOYMENT.md의 Turso와 Vercel 설정을 사용합니다.

# 외부 로그인·e-amusement 가져오기 검증 부채

실제 계정과 콘솔 등록이 필요해 자동으로 확인하지 못한 항목입니다.

## 배포 전에 할 일

- [ ] GitHub OAuth 앱 콜백 주소에 `<BETTER_AUTH_URL>/api/auth/callback/github` 등록
- [ ] Naver 애플리케이션 콜백 주소에 `<BETTER_AUTH_URL>/api/auth/callback/naver` 등록, 제공 정보에 이메일 포함
- [ ] 환경변수 이름 확인: `GITHUB_CLIENT_ID`, `GITHUB_SECRET_KEY`, `NAVER_CLIENT_ID`(`NAVERE_`가 아님), `NAVER_SECRET_KEY`. 로컬과 Vercel 모두
- [ ] push하면 Vercel 빌드에서 마이그레이션 0005가 운영 DB에 적용됩니다. 추가만 하는 변경이고 기존 `user_record` 행을 이력으로 복사합니다

## 실제 환경에서 확인

- [ ] GitHub 로그인 왕복(대표 출처)
- [ ] Naver 로그인 왕복(대표 출처)
- [ ] 대표 출처가 아닌 운영 출처에서 시작한 외부 로그인. `oAuthProxy`가 약 1850자 state와 암호화된 프로필을 넘깁니다
- [ ] 이메일로 가입한 계정과 같은 이메일로 외부 로그인하면 연결 불가 안내가 나오는지
- [x] 익스텐션 service worker의 세션 확인 요청에 쿠키가 붙는지 — 2026-10-07 사용자 실기에서 계정 이름과 핸들이 표시됨
- [ ] 익스텐션의 반영 버튼 → `/import` 탭이 열리고 업로드 중 → 결과 표가 뜨는지, popup 반영 카드에 같은 결과가 남는지
- [ ] 비로그인 상태에서 `/import`가 로그인을 안내하고 로그인 뒤 이어서 업로드하는지(외부 로그인 리다이렉트 뒤 포함)
- [ ] 한국어가 아닌 브라우저에서 `/en/import`·`/ja/import`로 넘어가도 동작하는지
- [ ] 실제 수집 결과의 `unmatched` 목록. 곡명 정규화가 다른 차트가 나오면 별칭 표를 만듭니다
- [ ] Turso에서 레벨 12 전체(약 600건) 가져오기 한 번의 소요 시간

## 보류한 리뷰 지적

- 셸 아래 어느 페이지든 `?error=<값>`이 붙으면 외부 로그인 실패 토스트가 뜹니다. 문구는 고정이라 주입 위험은 없습니다.
- 변경이 0건이어도 `eamusement_import` 행은 늘어납니다(사용자당 10초에 1행). 보존 한도는 정하지 않았습니다.
- 관리자 초기 지정은 이메일만 봅니다. 외부 가입에 `emailVerified`를 요구할지는 정하지 않았습니다. 이메일 가입도 같은 조건이라 이번 변경으로 나빠지지는 않았습니다.
- 가져온 시각 표시에 게시판용 `BoardTimestamp`를 재사용했습니다. 이름을 공용으로 바꾸는 일은 하지 않았습니다.
- `SQLITE_BIND_PARAMETER_LIMIT`가 `catalog.storage.ts`와 `eamusement.storage.ts`에 각각 있습니다.

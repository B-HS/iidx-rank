# 운영 도메인 가입 거부

대상: src/shared/server/auth.ts, auth-origins.ts, http.ts, src/entities/auth/auth-error.ts, src/features/auth-dialog/auth-dialog.tsx

증상: 계정 만들기에서 입력 내용과 무관하게 계정을 확인할 수 없다는 포괄 오류가 표시됐습니다.

관찰: 2026-10-05 13:32:02 / 13:32:08 UTC 운영 로그에서 iidx.hyns.dev의 sign-up/email 요청이 403 INVALID_ORIGIN이었습니다. 계정을 만들 수 없는 짧은 비밀번호의 동일 검증 요청도 vercel 도메인은 400 PASSWORD_TOO_SHORT, 커스텀 도메인은 403 INVALID_ORIGIN이었습니다.

원인: trustedOrigins가 BETTER_AUTH_URL 하나만 허용하여 연결된 커스텀 운영 도메인이 빠졌고, UI가 모든 인증 오류를 같은 안내로 처리했습니다.

수정: 두 운영 HTTPS 도메인을 명시적으로 허용하고 인증과 기록·설정 변경 API가 동일한 목록을 사용합니다. 로컬에서는 설정된 로컬 출처만 허용합니다. 와일드카드나 요청 Host 반사를 사용하지 않습니다. 오류 코드에 따라 출처·중복 이메일·비밀번호·인증·요청 제한·서버·네트워크 오류를 각각 번역합니다.

검증: 분리 로컬 DB의 가입/로그인 200, 중복 422, 비밀번호 400, 다른 출처 403, 세션 UUID 일치, PATCH/GET 설정 200을 확인했습니다. UI에서도 중복 이메일의 영어 안내를 확인했습니다. 운영 반영 후 두 도메인 검증은 이력 문서에 추가합니다. 이번 작업에서 운영 계정 삭제 또는 테스트 가입을 수행하지 않습니다.

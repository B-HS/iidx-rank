# 다국어와 비로그인 설정 결정

대상: src/shared/i18n, src/shared/messages, src/entities/preferences, src/app/[locale]

- 사용자가 이번 작업을 main 직접 수행으로 선택했습니다. 서브에이전트는 사용하지 않았습니다.
- next-intl 4.14.9를 선택했습니다. 기존 Next App Router·Cache Components·React Compiler와 통합하면서 ICU·접근성·서버/클라이언트 번역·언어 경로 및 쿠키를 함께 관리하기 위해 추가했습니다.
- 한국어 ko는 기본 경로 /, 일본어 ja는 /ja, 영어 en은 /en입니다. 일본어 선택의 UI 표기는 JP입니다. NEXT_LOCALE 쿠키로 언어 선택을 유지합니다.
- 사용자 메뉴의 설정 모달에서 언어와 표시 방식을 선택합니다. 가입·로그인·필터·상세·오류·알림·접근성·날짜도 카탈로그를 사용합니다. 곡명·시리즈의 고유 명칭은 원본 값을 유지합니다.
- 비로그인 표시 설정은 iidx:anonymous-display:v1과 iidx-anonymous-display에 로고/시리즈명·불투명도만 저장합니다. 쿠키는 첫 화면의 서버·클라이언트 크기를 맞추는 기준이며 localStorage는 대체 저장소입니다. Cookie 미설정 시 브라우저 복원이 끝날 때까지 표의 전체 영역을 유지합니다.
- 로그인 설정은 기존 UUID별 DB·revision·캐시 태그를 사용하며 비로그인 저장소와 병합하지 않습니다.
- next-intl 요청 설정의 default export, 공식 createNavigation 반환 export, AppConfig의 interface module augmentation은 라이브러리의 필수 계약을 따릅니다. Next 페이지·레이아웃의 default export도 공식 계약입니다. 나머지는 기존 named export·원본 유도 타입을 유지합니다.

공식 근거: https://next-intl.dev/docs/routing/setup · https://next-intl.dev/docs/routing/configuration · https://next-intl.dev/docs/environments/server-client-components · 설치된 Next 16.3.8의 use-cache·authentication-with-cache-components·internationalization 문서

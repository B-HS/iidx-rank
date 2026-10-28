# 웹에서 직접 e-amusement 수집 검토와 제외 결정

## 결정

사용자 결정(2026-10-29): 익스텐션 없이 사이트에서 e-amusement 기록을 수집하는 기능은 만들지 않습니다. 수집은 기존 Chrome 익스텐션만 사용합니다.

## 사이트만으로 불가능한 이유

2026-10-29에 `p.eagate.573.jp` 응답을 직접 확인한 결과입니다.

- 응답에 `Access-Control-Allow-Origin`이 없어 iidx.hyns.dev의 fetch는 응답을 읽을 수 없습니다.
- 세션 쿠키 `M573SSID`는 `HttpOnly`이고 SameSite 지정이 없어(Lax), 다른 사이트에서 보낸 요청에는 붙지 않습니다.
- `X-FRAME-OPTIONS: SAMEORIGIN`이라 iframe으로 띄울 수 없습니다.
- Imperva(Incapsula) 쿠키가 붙어 있어, 서버에서 대신 수집하면 봇 차단에 걸릴 가능성이 큽니다.
- 로그인은 `my.konami.net` KONAMI ID OIDC로 넘어가며, `client_id`와 `redirect_uri`가 eagate 전용입니다. 사이트는 로그인 페이지 링크만 제공할 수 있고, 로그인 여부도 확인할 수 없습니다.

## 검토한 대안

| 방식 | 판단 |
| --- | --- |
| 북마클릿 + 같은 탭에서 `/import#데이터`로 이동 | 기술적으로 가능합니다. eagate에는 CSP가 없고 응답은 UTF-8 정적 HTML입니다. 다만 북마크 등록이 필요하고 iOS 실기기 확인이 남아 있어 제외했습니다 |
| 북마클릿 + 새 탭 + `postMessage` | iOS 팝업 차단과 백그라운드 탭 정지 위험이 있습니다 |
| 북마클릿 + API 직접 POST(개인 토큰) | 토큰이 북마크에 담기고 인증 경로가 늘어 비추천합니다 |
| iOS 단축어 "웹 페이지에서 JavaScript 실행" | Apple 공식 기능이며, 북마클릿이 실패할 때의 대안입니다 |
| iOS Safari 웹 익스텐션 | Xcode, Apple 개발자 등록, App Store 심사가 필요합니다 |
| 공식 CSV 다운로드 + 업로드 | 유료 코스가 필요한 것으로 보입니다(미확정) |
| 서버가 ID·비밀번호로 대신 로그인 | 비밀번호를 맡아야 하고, OIDC·캡차·봇 차단 때문에 제외합니다 |

다시 검토할 때는 실제 iPhone Safari에서 확인용 북마클릿으로 실행 여부, 같은 출처 수집, Imperva 통과, `CompressionStream` 지원을 먼저 확인합니다.

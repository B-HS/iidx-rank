# Vercel Web Analytics·Speed Insights

2026-10-05 사용자 요청으로 main이 직접 적용했습니다.

- @vercel/analytics 2.0.1, @vercel/speed-insights 2.0.0을 Bun으로 설치하고 bun.lock에 기록했습니다.
- src/app/layout.tsx의 body에서 Analytics와 SpeedInsights를 Next 전용 export로 한 번씩 렌더합니다. 전체 경로에 적용되며 기존 AppProviders와 서버 layout을 유지합니다.
- Vercel Analytics actions의 Disable Web Analytics 항목으로 활성 상태를 확인했습니다. Speed Insights는 Get Started·No events collected 화면이며 Plus 업그레이드는 적용하지 않았습니다.
- 환경 파일 없는 임시 복사본에서 frozen install 및 bun run build 성공, 타입 검사 성공, Cache Components·홈 PPR 유지. 이전 작업의 임시 QA 스크립트가 복사본 타입 검사에 포함된 첫 시도는 실패했고, 해당 임시 파일을 복사본 밖으로 옮긴 뒤 실제 프로젝트 입력으로 빌드에 성공했습니다.
- 구현 commit 0fa62df의 Production 배포 dpl_CiVhfCE4cErJLGQGdnh94mWdB2Di가 READY이며 공통 layout의 두 스크립트가 실제 운영 DOM에서 한 번씩 확인되고 모두 HTTP 200입니다. 임의 custom event나 개인 식별 데이터 전송은 추가하지 않았습니다.

공식 근거: https://vercel.com/docs/analytics/quickstart, https://vercel.com/docs/speed-insights/quickstart.

## 실제 수집 확인

- https://iidx-rank.vercel.app에서 Analytics 2.0.1, Speed Insights 2.0.0 SDK 속성과 Vercel의 고유 수집 경로를 확인했습니다. 스크립트 두 개 모두 application/javascript, HTTP 200입니다.
- Analytics view 요청 HTTP 200 및 대시보드 Visitors 1 / Page Views 1을 확인했습니다. 캡처 iidx-rank-analytics.png를 저장했습니다.
- Speed Insights SDK와 vitals 전송 경로는 주입됐으나 확인 시점의 대시보드는 No events collected 상태였습니다. 성능 이벤트 집계 표시를 확인한 것으로 보고하지 않습니다. 방문 데이터가 쌓인 후 dashboard에서 확인합니다.
- 브라우저에서 React 텍스트 hydration 경고 #418을 관찰했고 변경 전 27e5147 배포에서도 동일하게 재현했습니다. 이번 두 패키지 추가에서 생긴 경고가 아닙니다. 실제 방문 view 수신은 정상이며 기존 렌더 불일치 원인 수정은 별도 범위입니다.

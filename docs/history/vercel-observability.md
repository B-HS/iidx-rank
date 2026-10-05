# Vercel Web Analytics·Speed Insights

2026-10-05 사용자 요청으로 main이 직접 적용했습니다.

- @vercel/analytics 2.0.1, @vercel/speed-insights 2.0.0을 Bun으로 설치하고 bun.lock에 기록했습니다.
- src/app/layout.tsx의 body에서 Analytics와 SpeedInsights를 Next 전용 export로 한 번씩 렌더합니다. 전체 경로에 적용되며 기존 AppProviders와 서버 layout을 유지합니다.
- Vercel Analytics actions의 Disable Web Analytics 항목으로 활성 상태를 확인했습니다. Speed Insights는 Get Started·No events collected 화면이며 Plus 업그레이드는 적용하지 않았습니다.
- 환경 파일 없는 임시 복사본에서 frozen install 및 bun run build 성공, 타입 검사 성공, Cache Components·홈 PPR 유지. 이전 작업의 임시 QA 스크립트가 복사본 타입 검사에 포함된 첫 시도는 실패했고, 해당 임시 파일을 복사본 밖으로 옮긴 뒤 실제 프로젝트 입력으로 빌드에 성공했습니다.
- Production 배포와 수집 스크립트 로드는 배포 후 확인합니다. 임의 custom event나 개인 식별 데이터 전송은 추가하지 않았습니다.

공식 근거: https://vercel.com/docs/analytics/quickstart, https://vercel.com/docs/speed-insights/quickstart.

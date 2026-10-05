# Production CSS 의존성 누락

첫 Vercel Production 빌드는 src/app/globals.css의 shadcn/tailwind.css를 찾지 못해 실패했습니다. 로컬 node_modules에 shadcn이 남아 있었지만 package.json과 bun.lock에 선언되지 않아 새 설치 환경에서는 사용할 수 없었습니다.

공식 shadcn 수동 설치 문서에 따라 shadcn 4.21.1을 정식 의존성으로 추가했습니다. 원래 CSS import와 디자인을 유지합니다.

.env와 기존 node_modules를 제외한 임시 복사본에서 frozen install 및 Next build가 성공했습니다. TypeScript와 Cache Components, 홈 Partial Prerender 및 동적 API 경로를 함께 확인했습니다.

근거: https://ui.shadcn.com/docs/installation/manual

# 구현 결정

- 최신 난이도 데이터는 Google Sheets의 공개 HTML을 원본으로 사용합니다. 불정기 갱신 JSON은 사용하지 않습니다.
- 런타임과 패키지 관리 Bun, Next.js App Router, React Compiler, Tailwind 및 shadcn, better-auth 이메일/비밀번호 인증, Drizzle와 libSQL SQLite 파일을 사용합니다.
- shadcn는 UI에 필요한 원시 컴포넌트를 적극적으로 가져와 응용합니다. 모든 컴포넌트를 억지로 한 번씩 배치하지 않습니다.
- 디자인 참고 문서는 docs/DESIGN.md 하나로 관리합니다. 내용이 같던 중복 사본 docs:/DESIGN.md는 2026-10-06에 삭제했습니다. 스타일 규칙만 적용하며 원본 프로젝트 경로·Vite·Hono·관측 도메인은 이 프로젝트 요구사항으로 취급하지 않습니다.
- 사용자 최신 지시로 이후 시작하는 서브에이전트는 gpt-6-luna, max effort를 명시합니다. Fast를 선택하는 도구 파라미터가 없어 적용 여부를 주장하지 않습니다. 오케스트레이터 모델 설정은 변경하지 않습니다.
- gpt-6-luna 외 모델로 구현하지 않습니다. 하위 에이전트는 Git을 수행하지 않습니다. 시작 당시 Git 저장소와 remote가 없습니다.
- 소스 집계 중 DOM 순회용 mutable accumulator와 생성된 shadcn compound primitive의 다중 export는 라이브러리 계약·색 상속 처리 경계에 제한합니다. 제품 도메인 컴포넌트는 SFC를 유지합니다.
- 비공개 데이터의 서버 캐시는 세션 검증 후 UUID 인자와 태그를 사용합니다. 세션 자체와 HTTP 응답을 공유 캐시에 저장하지 않습니다.

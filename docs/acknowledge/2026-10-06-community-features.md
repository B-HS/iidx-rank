# 커뮤니티 기능·R2·DP 관련 결정

대상: docs/COMMUNITY.md(구현 계약), src/shared/server/env.ts, src/entities/catalog

2026-10-06 사용자 결정과 조사로 확인한 전제입니다.

- 진행: workflow 사용(main Opus, 하위 Opus/Sonnet, Fable 미사용). 기능 단위로 검증 후 main에 푸시합니다. 푸시마다 Production 마이그레이션과 배포가 실행됩니다.
- 사용자 주소는 고유 핸들 /u/<핸들>, 기존 계정은 마이그레이션에서 자동 핸들을 받고 설정에서 바꿉니다. 프로필 공개 기본값은 비공개입니다.
- 프로필 사진과 게시판 이미지는 반드시 Cloudflare R2에 저장합니다. 사용자가 이미지 기능을 빼지 말라고 명시했습니다. env 키는 R2_ACCESS_KEY, R2_SECRET_KEY, R2_URL이며 사용자가 직접 등록했습니다. R2_URL은 S3 엔드포인트와 버킷 경로(https://<계정ID>.r2.cloudflarestorage.com/<버킷>) 형태라고 사용자가 확인했습니다. 에이전트는 값을 열람하지 않았습니다.
- 업로드는 브라우저 → Route Handler → R2, 조회는 Route Handler가 R2 응답을 스트리밍합니다. 버킷 CORS와 공개 도메인 설정에 의존하지 않기 위함입니다. Vercel 함수의 요청 본문 한도 4.5MB 때문에 파일 상한은 4MB입니다.
- 서명 클라이언트는 aws4fetch(의존성 0, Cloudflare 공식 예제 존재)를 선택했습니다. @aws-sdk/client-s3는 무겁고 R2에서 체크섬 설정 문제가 보고되어 쓰지 않습니다.
- 게시판은 글·댓글·본문 이미지입니다. 에디터는 사용자 지정대로 tiptap(v3)이며 본문은 JSON으로 저장하고 @tiptap/static-renderer로 React 요소를 만들어 dangerouslySetInnerHTML을 쓰지 않습니다.
- 언어 선택은 계정 메뉴로, 난이도표의 표시 설정은 /table 툴바 버튼으로 옮깁니다. 프로필 설정은 별도 페이지 /settings입니다.
- UI/UX 고도화는 감사 결과를 문서로 정리하고 일관성·접근성처럼 판단이 분명한 항목만 적용합니다.
- DP 난이도표: 현재 원본 스프레드시트(☆12参考表)의 8개 탭(はじめに, ノマゲ表, ハード表, 간이판 2개, 曲別表, 更新履歴, 旧曲投票済リスト)은 모두 SP ☆12 전용이며 DP 표가 없음을 2026-10-06 응답으로 확인했습니다. 사용자가 DP를 이번 범위에서 제외하기로 결정했습니다.

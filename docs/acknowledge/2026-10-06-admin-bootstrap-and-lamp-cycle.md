# 관리자 초기 지정 유지와 상위 램프 보호 결정

대상: src/shared/server/auth.ts, scripts/seed-admins.ts, src/entities/checker/checker-lamp.ts, src/widgets/checker-workspace/checker-workspace.tsx

2026-10-06 전체 감사의 결정 필요 항목 2건에 대한 사용자 결정입니다.

## 관리자 초기 지정 — 현행 유지

- 이메일 기반 초기 지정(가입 훅의 자동 승격과 배포 시 seed)을 그대로 둡니다. 코드는 변경하지 않습니다.
- ADMIN_BOOTSTRAP_EMAILS의 모든 이메일이 실제 소유자 계정으로 가입되어 있는지는 사용자가 운영에서 확인합니다. 에이전트는 Secret과 운영 DB를 열람하지 않으므로 이 확인을 대신하지 않았습니다.
- 목록에 아직 가입하지 않은 이메일을 추가하면 그 이메일로 먼저 가입한 사람이 admin이 됩니다. 이메일을 추가할 때는 해당 계정의 가입을 먼저 끝냅니다.
- admin 권한 범위를 원본 수동 수집 밖으로 넓히게 되면 이 결정을 다시 검토합니다.

## 카드 클릭의 램프 순환 — 상위 램프는 내려가지 않음

- 노멀 모드: NO_PLAY·FAILED·ASSIST → EASY → CLEAR → NO_PLAY. HARD·EX_HARD·FULL_COMBO는 클릭해도 그대로입니다.
- 하드 모드: NO_PLAY·FAILED·ASSIST·EASY·CLEAR → HARD → EX_HARD → NO_PLAY. FULL_COMBO는 클릭해도 그대로입니다.
- 순환의 되돌림(노멀 CLEAR → NO_PLAY, 하드 EX_HARD → NO_PLAY)은 설계된 동작으로 유지합니다.
- 램프가 바뀌지 않는 클릭은 저장 요청을 보내지 않습니다. 상위 램프를 낮추거나 지우려면 길게 누르기·우클릭·Shift+Enter로 여는 상세 창에서 변경합니다.

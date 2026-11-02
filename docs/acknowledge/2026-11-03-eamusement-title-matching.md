# e-amusement와 난이도표 곡명 표기 차이 보정

## 배경

익스텐션이 보내는 `chartId`는 곡명과 패턴 종류로 만든 해시입니다. e-amusement와 난이도표의 곡명 표기가 다르면 해시가 어긋나 `level === 12` 곡이 미일치(`unmatched`)로 남습니다. 운영 catalog(2026-10-29, 673곡)와 실제 가져오기 결과를 비교해 원인을 다음 여섯 곡으로 분류했습니다.

## 원인 분류

| 구분                  | e-amusement 표기                          | catalog 표기                             | catalog chartId                        | 처리                             |
| --------------------- | ----------------------------------------- | ---------------------------------------- | -------------------------------------- | -------------------------------- |
| 하트 기호 누락        | 表裏一体!?怪盗いいんちょの悩み            | 表裏一体!?怪盗いいんちょの悩み♥          | chart-a2c4cafeb943a31cbdb0da341e900d55 | 장식 기호(`So`) 제거             |
| 하트 기호·물결표 누락 | キャトられ恋はモ~モク                     | キャトられ♥恋はモ～モク                  | chart-23bd0d9e81ee1a2c7ed4fdd79185efc9 | 장식 기호 제거 + 물결표 통일     |
| 발음기호 누락         | 旋律のドグマ~Miserables~                  | 旋律のドグマ～Misérables～               | chart-1b579aee7142db0f5010410156e6cc2f | 라틴 결합문자 제거 + 물결표 통일 |
| 공백 차이             | Timepiece phase II (CN Ver.)              | Timepiece phase II(CN Ver.)              | chart-7448a0ee531538d0fb7c89c6de4eaf91 | 공백 전부 제거                   |
| 공백 차이             | We're so Happy (P\*Light Remix) IIDX ver. | We're so Happy(P\*Light Remix) IIDX ver. | chart-f0882c2abee3628f48cd203c663c2c54 | 공백 전부 제거                   |
| 글자 차이(원문 오타)  | 火影                                      | 焱影(SINOBUZ)                            | chart-3a5fdf0129496a9ab16dadb539c8de90 | 원문 별칭 `火影` → `焱影`        |

`火影`은 catalog에 곡이 없는 것이 아니라 표기만 다릅니다. 원문 표기는 자동 규칙으로 합칠 수 없으므로 별칭 목록에 원문 쌍으로 선언합니다.

## 결정

- `chartId` 해시 입력(`normalizeTitleKey`)은 바꾸지 않습니다. 기존 `user_record.chart_id`와 호환되어야 하기 때문입니다.
- 해석 순서는 다음과 같습니다.
    1. 가져온 `chartId`가 활성 catalog에 있으면 그 차트를 씁니다. 곡명이 달라도 우선합니다.
    2. 없으면 `chartMatchKey(title, difficulty)`로 catalog를 찾습니다.
    3. 그래도 없거나 같은 보정 키의 catalog 차트가 둘 이상이면 미일치로 남깁니다.
- 보정 키는 NFKD 분해 뒤 라틴 문자에 붙은 결합문자만 떼고 NFC로 다시 합칩니다. 가나의 탁점은 보존하므로 `ドグマ`와 `トクマ`는 합쳐지지 않습니다. 이어서 물결표 `〜 ～ ∼`를 `~`로, 유니코드 기호 문자(`So`, 예: `♥`)를 지우고, 공백을 모두 지운 뒤 대문자로 바꿉니다.
- 같은 차트로 해석되는 항목이 여럿이면 마지막 항목이 이기고, 변경 목록 순서는 처음 나온 차트 순서를 유지합니다.
- 모호성은 잘못 붙이는 것보다 미일치로 남기는 쪽을 택했습니다. 운영 catalog 673곡에서 이 보정 키와 난이도의 충돌은 0건입니다.

## 검증

`bun test src/entities/eamusement src/entities/catalog`로 실제 여섯 곡, 정확 일치 우선, 보정 키 중복 시 미일치, 탁점 보존을 고정했습니다. 운영 catalog 673곡을 내려받아 다음을 확인했습니다.

- 보정 키+난이도 충돌 0건
- 여섯 곡의 e-amusement 표기가 각각 위 표의 chartId 하나로 해석됨

## 별칭 추가 방법

1. 가져오기 결과의 `unmatched`에서 같은 곡이 두 표기로 반복되는지 확인합니다.
2. `src/entities/catalog/chart-title.ts`의 `TITLE_MATCH_ALIASES`에 `[e-amusement 표기, catalog 표기]` 쌍을 그대로 넣습니다.
3. `bun test src/entities/eamusement src/entities/catalog`로 확인합니다. 보정 키가 겹치는 catalog 차트가 생기면 그 곡은 미일치로 남으므로, 같은 키가 둘 이상이 되지 않는지 함께 확인합니다.

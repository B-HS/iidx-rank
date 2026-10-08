# e-amusement 가져오기·익스텐션 연동 계약

iidx-rank(이 저장소)와 익스텐션 iidx-data-parser(`/Users/hyunseokbyun/development/iidx-data-parser`, GitHub `B-HS/iidx-rank-data-parser`)가 함께 지키는 계약입니다. 두 저장소의 구현이 이 문서와 다르면 이 문서를 먼저 고칩니다. 결정 근거는 `docs/acknowledge/2026-10-07-eamusement-import-oauth.md`에 있습니다.

## 흐름

1. 사용자가 브라우저에서 iidx-rank에 로그인합니다(이메일·GitHub·Naver).
2. 익스텐션이 `GET /api/extension/session`으로 브라우저의 iidx-rank 세션을 확인합니다.
3. 익스텐션이 e-amusement에서 데이터를 수집합니다.
4. 수집이 끝나고 세션이 있으면 익스텐션이 `POST /api/import/records`로 rank-import v2 본문을 보냅니다.
5. 서버가 세션의 사용자 UUID로 기록을 반영합니다. 요청 본문의 사용자 식별 정보는 신뢰하지 않습니다.
6. 익스텐션 없이도 설정 화면에서 rank-import v2 파일을 올려 같은 API로 반영할 수 있습니다.

익스텐션은 iidx-rank 쿠키 값을 읽거나 저장하지 않습니다. `host_permissions`에 iidx-rank 출처를 넣고 `fetch(..., { credentials: 'include' })`로 브라우저가 쿠키를 붙이게 합니다.

## rank-import v2 본문

```jsonc
{
    "version": 2,
    "kind": "iidx-rank-import",
    "generatedAt": "2026-10-07T10:05:00.000Z",
    "gameVersion": 34,
    "style": 0,
    "player": {
        "djName": "-TEST-",
        "iidxId": "1234-5678",
        "danRank": "十段",
        "djPoint": 1234.56,
        "playCountSp": 432,
        "playCountDp": 123,
    },
    "notesRadar": { "NOTES": 128.45, "CHORD": 131.22, "PEAK": 118.9, "CHARGE": 142.0, "SCRATCH": 136.75, "SOF-LAN": 124.1 },
    "charts": [
        {
            "chartId": "chart-6d4d8c5dd256f3870c3527063b541f01",
            "title": "冥",
            "difficulty": "A",
            "level": 12,
            "lamp": "FULL_COMBO",
            "scoreGrade": "AAA",
            "exScore": 3123,
            "missCount": 2,
        },
    ],
}
```

| 필드                             | 규칙                                                                     |
| -------------------------------- | ------------------------------------------------------------------------ |
| `version` / `kind`               | 리터럴 `2` / `'iidx-rank-import'`. 다르면 400 `INVALID_INPUT`            |
| `generatedAt`                    | ISO 8601 UTC                                                             |
| `gameVersion`                    | 양의 정수                                                                |
| `style`                          | `0` SP, `1` DP. 서버는 `0`만 받습니다. `1`은 400 `UNSUPPORTED_STYLE`     |
| `player`                         | 객체 또는 `null`. 각 필드는 값 또는 `null`. 문자열은 최대 64자           |
| `notesRadar`                     | 6축 객체 또는 `null`. 각 축은 0 이상의 숫자 또는 `null`                  |
| `charts`                         | 최대 20000건. 0건도 허용                                                 |
| `charts[].chartId`               | `^chart-[a-f0-9]{32}$`                                                   |
| `charts[].title`                 | 1~200자                                                                  |
| `charts[].difficulty`            | `B` `N` `H` `A` `L`                                                      |
| `charts[].level`                 | 1~12 정수                                                                |
| `charts[].lamp`                  | `NO_PLAY` `FAILED` `ASSIST` `EASY` `CLEAR` `HARD` `EX_HARD` `FULL_COMBO` |
| `charts[].scoreGrade`            | `F` `E` `D` `C` `B` `A` `AA` `AAA` 또는 `null`                           |
| `charts[].exScore` / `missCount` | 0 이상의 정수 또는 `null`                                                |

모르는 필드는 거부합니다(strict). 필드를 추가할 때는 `version`을 올립니다.

## API

모든 응답은 `{ success: true, data }` 또는 `{ success: false, error: { code, message } }`이고 `Cache-Control: private, no-store`입니다.

### GET /api/extension/session

- 인증: 세션 쿠키. 없으면 `user: null`을 200으로 돌려줍니다.
- 응답 data: `{ user: { id, name, handle } | null }`
- 세션 토큰·이메일은 응답에 넣지 않습니다. CORS 헤더를 붙이지 않으므로 웹 페이지는 응답을 읽지 못하고, `host_permissions`가 있는 익스텐션만 읽습니다.

### POST /api/import/records

- 출처: `Origin`이 사이트 출처(`getAuthOrigins()`) 또는 `EXTENSION_ORIGINS`에 있어야 합니다. 아니면 403 `ORIGIN_NOT_ALLOWED`.
- 인증: 세션 필수. 없으면 401 `AUTH_REQUIRED`.
- 본문: `application/json`, 최대 2MB. rank-import v2.
- 빈도: 같은 사용자의 직전 가져오기 후 10초 안에는 429 `IMPORT_COOLDOWN`.
- 응답 data:

```jsonc
{
    "importId": 12,
    "channel": "extension",
    "importedAt": "2026-10-07T10:05:03.000Z",
    "receivedCount": 612,
    "matchedCount": 598,
    "changedCount": 41,
    "unmatched": [{ "title": "곡명", "difficulty": "A" }],
}
```

- `channel`: 요청 출처가 `EXTENSION_ORIGINS`에 있으면 `extension`, 사이트 출처면 `file`.
- `receivedCount`: 본문 `charts` 수.
- `matchedCount`: `level === 12`이고 활성 catalog 차트와 `chartId`가 일치한 수.
- `changedCount`: 실제로 기록이 바뀌어 이력에 추가된 수.
- `unmatched`: `level === 12`인데 catalog에 없는 차트. 최대 200건. 곡명 정규화 차이를 찾는 근거입니다.
- 반영 후 `user:<uuid>:records`와 `users:recent` 태그를 `revalidateTag(tag, { expire: 0 })`로 만료합니다. 프로필 조회는 서버 캐시 없이 요청마다 DB를 읽습니다.

### GET /api/import/status

- 인증: 세션 필수.
- 응답 data: `{ latest: ImportStatus | null }`. `ImportStatus`는 `{ importedAt, channel, receivedCount, matchedCount, changedCount, player: { djName, iidxId, danRank, djPoint, playCountSp, playCountDp }, notesRadar }`입니다.
- 시각과 건수는 가장 최근 가져오기의 값이고, `player`와 `notesRadar`는 DJ NAME이 있는 가장 최근 가져오기의 값입니다. 플레이어 정보를 읽지 못한 가져오기가 이전 정보를 가리지 않게 하기 위함입니다. 6축이 모두 비어 있으면 `notesRadar`는 `null`입니다.

## 반영 규칙

- 대상은 SP(`style === 0`)의 `level === 12` 차트 중 활성 catalog에 있는 것입니다. catalog의 `chartId`는 곡명과 패턴 종류만으로 만들어지므로 DP나 다른 레벨을 섞으면 다른 차트와 충돌합니다.
- 가져온 램프가 `NO_PLAY`인 차트는 기록으로 취급하지 않고 건너뜁니다. e-amusement의 미플레이 표시는 값이 없다는 뜻이므로 기존 기록을 지우지 않습니다.
- 그 밖에는 최신 값이 이깁니다. 기준 시각은 관측 시각(`generatedAt`과 서버 수신 시각 중 이른 쪽)입니다. 현재 기록의 `updated_at`이 관측 시각보다 나중이면 그 차트는 건너뜁니다. 오래된 파일이나 다른 기기의 예전 수집 결과가 그 뒤의 수정이나 더 새로운 가져오기를 덮지 않게 하기 위함입니다.
- 가져온 `scoreGrade`·`exScore`·`missCount`가 `null`이면 값이 없는 것으로 보고 현재 값을 유지합니다. 익스텐션은 MISS COUNT를 수집하지 않아 항상 `null`로 보냅니다.
- 이렇게 정한 `lamp`·`scoreGrade`·`exScore`·`missCount` 중 하나라도 현재 값과 다르면 현재 기록을 바꾸고 이력에 한 줄을 추가합니다. 네 값이 모두 같으면 아무것도 쓰지 않습니다.
- 가져오기로 바뀐 기록의 `updated_at`은 관측 시각이고, 이력의 `recorded_at`은 서버 수신 시각입니다.
- 메모는 항상 보존합니다.
- 가져오기 이후의 수동 수정도 같은 규칙으로 최신 값이 됩니다.
- 한 번의 가져오기는 하나의 트랜잭션입니다. 기록이 하나라도 바뀌면 `user_record_revision`을 1 올립니다.

## DB

모든 기록 변경은 이력에 insert하고, 조회는 차트별 최신 값을 읽습니다.

| 테이블                | 역할                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------- |
| `user_record`         | 차트별 최신 값(조회용). `ex_score`, `miss_count`, `source` 열을 추가합니다. `memo`는 여기에만 둡니다 |
| `user_record_history` | 추가만 하는 변경 이력. 수동 수정과 가져오기 모두 기록합니다                                          |
| `eamusement_import`   | 가져오기 1회 = 1행. 그 시점의 플레이어 정보와 노트레이더, 건수를 함께 둡니다                         |

`user_record_history`: `id`(자동 증가 PK), `user_id`, `chart_id`, `lamp`, `score_grade`, `ex_score`, `miss_count`, `source`(`manual`|`eamusement`), `import_id`(nullable, `eamusement_import.id`), `recorded_at`(ISO). 인덱스 `(user_id, chart_id, id)`.

`eamusement_import`: `id`(자동 증가 PK), `user_id`, `channel`(`extension`|`file`), `game_version`, `style`, `generated_at`, `dj_name`, `iidx_id`, `dan_rank`, `dj_point`, `play_count_sp`, `play_count_dp`, `radar_notes`, `radar_chord`, `radar_peak`, `radar_charge`, `radar_scratch`, `radar_soflan`, `received_count`, `matched_count`, `changed_count`, `created_at`(ISO). 인덱스 `(user_id, id)`.

- 수동 저장(`PATCH /api/records`)은 `lamp`·`scoreGrade`가 바뀔 때만 이력을 추가합니다. 메모만 바꾼 저장은 이력을 만들지 않습니다. 수동 저장은 `source`를 `manual`로 바꾸고 `ex_score`·`miss_count`는 그대로 둡니다.
- 마이그레이션은 기존 `user_record` 행을 `source = 'manual'`, `recorded_at = updated_at`으로 이력에 한 줄씩 옮깁니다.
- 프로필에 보이는 플레이어 정보는 해당 사용자의 DJ NAME이 있는 가장 최근 `eamusement_import` 행입니다. 공개 프로필에는 DJ NAME·단위·노트레이더·동기화 시각만 보이고 IIDX ID는 본인 설정 화면에서만 보입니다.

## 익스텐션 반영 흐름 (페이지 경유)

익스텐션은 `POST /api/import/records`를 직접 호출하지 않습니다. iidx-rank의 가져오기 화면을 열고 수집 데이터를 그 화면에 넘기면, 화면이 사이트 자신의 요청으로 업로드합니다. 익스텐션 ID를 서버에 등록할 필요가 없고 ID가 바뀌어도 영향이 없습니다.

1. 익스텐션 background가 넘겨줄 데이터가 있다는 표시(handoff)를 만들고 `<RANK_ORIGIN>/import`를 새 활성 탭으로 엽니다. handoff는 임의의 `handoffId`와 생성 시각을 갖고 10분 뒤 만료됩니다.
2. 가져오기 화면(`/import`)과 iidx-rank 출처에 주입된 익스텐션 content script가 `window.postMessage`로 대화합니다.
3. 화면은 받은 본문을 rank-import v2 스키마로 검증하고 `POST /api/import/records`로 업로드합니다. 요청 헤더 `X-Import-Channel: extension`을 붙이며, 서버는 사이트 출처의 요청일 때만 이 값을 `channel`에 반영합니다. 정보 표시용이고 권한 판단에는 쓰지 않습니다.
4. 화면은 대기 → 업로드 중 → 결과(건수, 바뀐 차트 표, 일치하지 않은 곡) 또는 실패를 보여 주고, 결과를 익스텐션에 돌려줍니다. 익스텐션은 그 결과를 마지막 반영 상태로 저장합니다. 성공이면 handoff를 지우고, 실패면 화면의 다시 시도 결과를 받을 수 있도록 만료까지 유지합니다.
5. 로그인하지 않은 상태면 화면이 로그인을 안내하고, 로그인 뒤 같은 본문으로 이어서 업로드합니다.

### 메시지

모든 메시지는 `window.postMessage(message, window.location.origin)`으로 보내고, 받는 쪽은 `event.source === window`와 `event.origin === window.location.origin`을 확인한 뒤 스키마로 검증합니다. 공통 필드 `channel`은 리터럴 `"iidx-rank-import"`입니다.

| type      | 방향            | 나머지 필드                                    | 의미                                                                   |
| --------- | --------------- | ---------------------------------------------- | ---------------------------------------------------------------------- |
| `hello`   | 익스텐션 → 화면 | 없음                                           | content script가 준비됨. 화면은 `ready`로 답합니다                     |
| `ready`   | 화면 → 익스텐션 | 없음                                           | 화면이 본문을 받을 준비가 됨. 마운트 직후와 `hello`를 받을 때 보냅니다 |
| `payload` | 익스텐션 → 화면 | `handoffId: string`, `payload: rank-import v2` | 넘겨줄 본문                                                            |
| `none`    | 익스텐션 → 화면 | 없음                                           | 대기 중인 handoff가 없음                                               |
| `result`  | 화면 → 익스텐션 | `handoffId: string`, `outcome`                 | 업로드 결과                                                            |

`outcome`은 `{ status: "success", result: ImportResult }` 또는 `{ status: "failed", code: string }`입니다. `code`는 서버 오류 코드(`AUTH_REQUIRED`, `IMPORT_COOLDOWN`, `UNSUPPORTED_STYLE`, `INVALID_INPUT` 등)이거나 화면이 정한 `INVALID_PAYLOAD`(본문 검증 실패), `REQUEST_FAILED`(네트워크)입니다.

- 화면은 같은 `handoffId`를 한 번만 업로드합니다. 실패 뒤의 다시 시도는 사용자가 버튼을 눌렀을 때만 합니다.
- 익스텐션은 성공 `result`를 받기 전까지 handoff를 유지해, 화면이 새로고침되거나 로그인으로 다시 열려도 같은 본문을 다시 넘길 수 있게 합니다.
- content script는 `ready`를 받을 때마다 background에 handoff를 묻습니다. 없거나 만료됐으면 `none`을 보냅니다.
- 화면은 `ready`를 보낸 뒤 일정 시간 안에 익스텐션의 응답(`hello`, `payload`, `none`)이 하나도 오지 않으면 익스텐션이 없는 것으로 보고 Chrome 웹 스토어 설치 링크와 설정의 파일 가져오기 링크를 보여 줍니다. `none`이 오면 익스텐션은 있으나 넘겨줄 데이터가 없는 것이므로 설치 링크 없이 익스텐션에서 반영을 시작하라는 안내를 보여 줍니다.

### 응답의 변경 목록

`ImportResult`에 `changes`가 추가됩니다. 이번 가져오기로 바뀐 차트의 목록이고 최대 1000건입니다.

```jsonc
{ "changes": [{ "chartId": "chart-...", "previousLamp": "CLEAR", "lamp": "HARD", "scoreGrade": "AA", "exScore": 3000 }] }
```

`previousLamp`는 기록이 없던 차트면 `null`입니다. 화면은 catalog로 `chartId`를 곡명과 패턴으로 바꿔 표로 보여 줍니다.

## 익스텐션 출처

- 익스텐션은 위의 페이지 경유 흐름을 쓰므로 서버에 ID를 등록하지 않아도 됩니다. `EXTENSION_ORIGINS`는 익스텐션 출처에서 직접 호출하는 클라이언트를 따로 허용할 때만 쓰는 선택 설정입니다.
- 압축 해제 로드의 ID는 폴더 경로에 따라 정해집니다. `chrome://extensions`에서 ID를 확인해 등록합니다.
- 익스텐션의 대상 출처는 빌드 시 `RANK_ORIGIN` 환경변수로 정하고 기본값은 `https://iidx.hyns.dev`입니다. 로컬 개발은 `RANK_ORIGIN=http://localhost:3000 bun run build`를 씁니다.

## 외부 로그인

- better-auth 내장 `github`·`naver` 프로바이더를 씁니다. 환경변수 `GITHUB_CLIENT_ID`·`GITHUB_SECRET_KEY`·`NAVER_CLIENT_ID`·`NAVER_SECRET_KEY`. ID와 Secret이 모두 있는 프로바이더만 켜고 화면에도 그 버튼만 보입니다.
- 콜백 주소는 `<BETTER_AUTH_URL>/api/auth/callback/github`, `<BETTER_AUTH_URL>/api/auth/callback/naver`입니다. 각 개발자 콘솔에 등록해야 합니다.
- 운영 출처가 둘이므로 better-auth의 `oAuthProxy` 플러그인을 씁니다. 프로바이더 콜백은 항상 `BETTER_AUTH_URL` 출처로 돌아오고, 다른 운영 출처에서 시작한 로그인은 그 출처로 넘겨져 세션이 만들어집니다. 콘솔에는 `BETTER_AUTH_URL`의 콜백 주소 하나만 등록합니다.
- 계정 연결은 better-auth 기본 정책을 따릅니다. 프로바이더가 이메일을 검증했고 기존 계정의 이메일도 검증된 경우에만 같은 이메일의 기존 계정에 자동 연결됩니다. 이 앱에는 이메일 인증 절차가 없으므로 이메일·비밀번호로 가입한 계정은 같은 이메일의 외부 로그인과 자동 연결되지 않고 `account_not_linked` 안내가 나옵니다. 가입 선점으로 계정을 빼앗기는 것을 막는 동작입니다.
- 프로바이더가 준 access token과 refresh token은 암호화해 저장합니다(`account.encryptOAuthTokens`).

## TODO

- 카카오 로그인(better-auth 내장 `kakao`).
- DP 난이도표와 DP 가져오기.
- 설정 화면의 외부 계정 연결·해제(로그인한 사용자가 직접 연결). 이것이 있어야 이메일로 가입한 기존 계정이 외부 로그인을 함께 쓸 수 있습니다.
- 익스텐션의 MISS COUNT 수집(곡 상세 페이지 필요).
- 차트별 이력 조회 화면.
- 곡명 정규화가 다른 차트의 별칭 표(`unmatched` 응답을 근거로 작성).

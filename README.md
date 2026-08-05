# 팀장 임파워먼트 대화 시뮬레이션

부서장이 팀장의 이름·성격·상황을 직접 입력하고, 그 설정으로 만들어진 AI 팀장과 실제 메신저처럼 대화하며 임파워먼트 행동을 연습하는 기업 리더십 교육용 웹 애플리케이션입니다. 대화가 끝나면 부서장의 발언만을 근거로 네 가지 축(20개 기준)을 ○ 충족 / △ 부분 / × 미확인 으로 점검합니다.

> 이 결과는 인사평가나 심리 진단이 아니라 리더십 교육을 위한 **대화 점검 도구**입니다. 점수나 등급은 매기지 않습니다.

---

## 1. 설치

```bash
npm install
```

Node.js 18.17 이상이 필요합니다. (개발·검증은 Node 22에서 진행)

## 2. 환경변수 설정

`.env.example` 을 복사해 `.env.local` 을 만듭니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `LLM_PROVIDER` | 사용할 Provider (`anthropic` \| `mock`) | `anthropic` |
| `ANTHROPIC_API_KEY` | Anthropic API Key. 비어 있으면 자동으로 Mock Mode | (없음) |
| `ANTHROPIC_MODEL` | 사용할 모델 | `claude-sonnet-5` |

API Key는 서버 라우트(`src/app/api/**`)에서만 사용하며 클라이언트 번들에 포함되지 않습니다. (`NEXT_PUBLIC_` 접두사를 쓰지 않습니다.)

## 3. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

## 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

타입 검사와 린트는 다음으로 실행합니다.

```bash
npm run typecheck
npm run lint
```

## 5. Mock Mode 사용법

`ANTHROPIC_API_KEY` 가 없거나 `LLM_PROVIDER=mock` 이면 Mock Mode로 동작합니다. 별도 설정 없이 `npm run dev` 만 실행해도 전체 흐름(시작 → 대화 → 종료 → 평가 보고서)을 확인할 수 있습니다.

- 팀장 응답: 부서장 발언을 9~12개 유형(막연한 격려 / 감정 인정 / 과거 경험 질문 / 사례 제공 / 구체적 지원 / 강압적 지시 / 업무 대신 수행 / 실행 행동 질문 / 후속 점검 등)으로 분류해 서로 다르게 반응하며, 같은 문장을 반복하지 않습니다.
- 평가: 대화 키워드·발언 길이·구조에 따라 점수가 달라집니다. 화면 상단과 보고서에 **Mock Mode 배지**가 표시됩니다.
- Mock 평가는 문장의 의미를 해석하지 않으므로 실제 채점 결과와 다릅니다. UI와 채점 파이프라인 점검용으로만 사용하십시오.

## 6. 기본 제공 페르소나와 상황

페르소나(성격·난이도)와 상황(시나리오)은 분리되어 있어  시작 화면에서 선택하며, 선택값은 `localStorage` 에 저장됩니다.

| 페르소나 | 난이도 | 특징 |
| --- | --- | --- |
| 이하늘 · 솔직한 의존형 (1년 차, 최연소 승격) | 하 | 감정 표현이 솔직하고 조언을 그대로 받아들이나, 방법이 없으면 다시 흔들림 |
| 박서연 · 근거를 따지는 논리형 (1년 차) | 중 | 근거와 기준으로 말하고 감정 표현을 절제함. 기준이 없으면 실행하지 않음 |
| 김도현 · 책임감 높은 자책형 (2년 차) | 상 | 결과 중심·책임감. 약점을 드러내기 싫어하고 정신론을 싫어함 |
| 정우재 · 말을 아끼는 냉소형 (7년 차) | 최상 | 말수가 적고 냉소적. 조건이 문서로 정리되지 않으면 움직이지 않음 |

페르소나에는 성격·습관·이력만 담고, 처한 사건은 모두 상황(시나리오) 쪽에 둡니다. 두 축이 겹치지 않으므로 어떤 팀장에게든 어떤 상황이든 붙일 수 있습니다.

| 상황 | 내용 | 권장 응답 |
| --- | --- | --- |
| 실패 이후 회복 | 일정 지연·보고 실패 후 신규 과제 회피 | 6회 |
| 권한과 역할 혼란 | 선배 팀원을 맡게 되어 결정이 뒤집힘 | 6회 |
| 관계 갈등 수습 | 팀원 갈등 조정 실패로 팀 분위기 침체 | 6회 |
| 소진과 신뢰 회복 | 반복된 압박과 지켜지지 않은 지원 약속 | 8회 |

페르소나는 말투·저항 방식·Mock 응답(`mockReplies`)을, 상황은 힌트·평가 후 개선 대화문(`coach`)·상황별 Mock 응답을 담당합니다. 역할 수행 시스템 프롬프트는 두 값을 합쳐 서버에서 조립합니다(`src/lib/prompts/roleplay-prompt.ts`).

첫 메시지는 조합마다 따로 작성되어 있습니다(`src/config/openings.ts` 의 `OPENINGS`). 같은 상황이라도 팀장에 따라 다른 문장으로 시작하며, 등록되지 않은 조합은 시나리오 기본 문장을 사용합니다. Mock Mode 에서는 상황이 만든 문장 뒤에 페르소나 말투 꼬리(`TAILS`)를 붙여 조합마다 다른 문장이 되도록 합니다.

## 7. 페르소나 추가 방법

1. `src/config/personas/` 에 새 파일을 만듭니다. (예: `senior-persona.ts`)
2. `Persona` 타입(`src/types/persona.ts`)에 맞춰 값을 채웁니다. 필수 항목은 id·name·position·subtitle·tenure·level·levelLabel·tagline·greeting·personality·resistancePatterns 입니다. 채팅 헤더의 이름·프로필·부가 정보는 `name`, `profileImage`, `subtitle` 값을 그대로 사용합니다.
3. `src/config/personas/index.ts` 의 `personaList` 배열에 추가하면 시작 화면 카드에 자동으로 나타납니다.

```ts
// src/config/personas/index.ts
import { seniorPersona } from "./senior-persona";

export const personas: Record<string, Persona> = {
  [defaultPersona.id]: defaultPersona,
  [seniorPersona.id]: seniorPersona,
};
```

`profileImage` 에 `/personas/xxx.png` 처럼 `public/` 경로를 지정하면 기본 사람 아이콘 대신 사진이 표시됩니다.

## 8. 상황(시나리오) 추가 방법

1. `src/config/scenarios/` 에 새 파일을 만들고 `Scenario` 타입에 맞춰 작성합니다.
2. `personaId` 로 사용할 페르소나를 연결합니다.
3. `src/config/scenarios/index.ts` 의 `scenarioList` 배열에 추가합니다.
4. `opening`(첫 메시지), `hints`, `coach`(영역별 개선 대화문 4종 + 시작·마무리 예시), `recommendedUserTurns`, `maxUserTurns` 를 함께 지정합니다.
5. Mock Mode 에서 상황에 맞게 반응하도록 `mockReplies` 에 의도별 응답을 추가할 수 있습니다.

API 는 `scenarioId`, `personaId` 를 받도록 되어 있으므로, 시작 화면에서 선택 UI만 추가하면 다중 시나리오로 확장할 수 있습니다.

## 9. 주요 구조

```
src/
  app/
    page.tsx                  시작 화면 (페르소나 · 상황 선택)
    simulation/page.tsx       스마트폰 채팅 화면
    report/page.tsx           결과 보고서
    api/simulation/start/     세션 초기화 + 첫 메시지
    api/chat/                 팀장 역할 응답
    api/evaluate/             대화 점검 + 서버 재검증
    custom/page.tsx           팀장·상황 직접 입력
  components/
    phone/                    스마트폰 프레임 / 노치 / 홈 인디케이터
    chat/                     헤더·말풍선·시간·입력창·메뉴·모달
    report/                   축 카드·근거·주의 발언·개선 대화문·대화 기록
    common/                   확인 모달 / 로딩 / 오류
  config/personas/            페르소나 4종 (성격 · 난이도 · 말투)
  config/scenarios/           상황 4종 (힌트 · 개선 대화문 · 상황별 응답)
  config/openings.ts          조합별 첫 메시지 + 페르소나 말투 꼬리
  lib/llm/                    Provider 인터페이스 + Anthropic + Mock
  lib/prompts/                역할 수행 프롬프트 / 평가 프롬프트
  lib/evaluation/             Zod 스키마·인용문 검증·판정 재검증·Mock 점검
  lib/custom.ts               직접 입력값 검증과 변환
  config/axes.ts              점검 축 정의 (A형 / B형)
  lib/storage/                localStorage 세션 저장·복구
  types/                      chat · persona · scenario · evaluation · session
```

## 10. 평가 체계 요약

- 4개 영역 × 25점 = 100점. 각 영역은 5개 세부 기준(0~5점)으로 구성됩니다.
- 감점은 실제 발언 근거가 확인된 항목만 적용하며 총 감점은 최대 20점입니다.
- 등급: 90+ 탁월 / 80+ 우수 / 70+ 보완 필요 / 60+ 미흡 / 그 외 재훈련 필요.
- 통과 조건: 최종 80점 이상 **그리고** 4개 영역 모두 15점 이상 **그리고** 심각한 비난·조롱·위협 발언 없음.
- AI가 반환한 총점은 신뢰하지 않고 서버에서 다시 계산합니다.

## 11. 남아 있는 제한사항

- 페르소나 4종 · 상황 4종이 포함되어 있으며, 조합의 자연스러움은 검수하지 않습니다. (예: 7년 차 팀장에게 신임 팀장용 상황을 붙일 수 있음)
- 이모지·이미지 첨부 버튼은 시각 요소로만 구현되어 있고 "추후 지원 예정" 툴팁이 표시됩니다.
- 세션은 브라우저 `localStorage` 에만 저장되며 서버 영속화나 학습자 계정 관리는 없습니다.
- 프로필 이미지는 경로 등록만 지원하며 업로드 기능은 없습니다.
- Mock 점검은 키워드 기반이라 실제 LLM 판정과 다릅니다. 특히 직접 입력한 상황에서는 맞지 않습니다.

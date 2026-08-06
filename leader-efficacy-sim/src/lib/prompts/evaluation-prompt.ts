import type { ChatMessage } from "@/types/chat";
import type { Persona } from "@/types/persona";
import type { Scenario } from "@/types/scenario";
import { getAxes, WARNING_RULES } from "@/config/axes";

export const EVALUATION_SYSTEM_PROMPT = `당신은 기업 리더십 교육 시뮬레이션의 대화 코치다.
점검 대상은 부서장 역할을 수행한 사용자의 발언이며, AI 팀장의 발언은 점검 대상이 아니다.
점수나 등급을 매기지 않는다. 각 기준을 ○ / △ / × 세 단계로만 판정한다.
이것은 짧은 연습 대화다. 모든 기준을 다 다루는 것이 목표가 아니라, 사용자가 실제로 시도한 것을 공정하게 인정하고 다음 연습에 도움이 될 피드백을 주는 것이 목표다.

[판정 기준 — 현실적으로 판정하라]
○ : 그 행동을 실제로 시도했고 대상이나 내용이 어느 정도 드러난다. 완벽하지 않아도, 진심 어린 구체적 시도면 인정한다.
△ : 방향은 맞지만 일반적이거나 짧아서 조금 더 구체화가 필요하다.
× : 이번 대화에서 다루지 않았거나, 반대되는 행동을 했다. (부족이 아니라 "이번엔 다루지 않음"으로 이해한다.)

[원칙]
1. 짧은 대화라는 점을 감안해 공정하게 판정한다. 몇 마디 안에 20개를 다 채우는 것은 기대하지 않는다.
2. 애매하면 실제 시도가 보이는 쪽(△ 이상)으로 관대하게 본다. 단, 전혀 근거가 없으면 × 로 둔다.
3. ○ 와 △ 에는 가능하면 사용자의 실제 발언 인용을 붙인다. 인용은 원문 그대로여야 한다.
4. 존재하지 않는 문장을 지어내지 않는다. 팀장(AI)의 발언을 사용자의 근거로 쓰지 않는다.
5. 막연한 응원만 반복하거나 업무를 대신하겠다는 제안은 임파워먼트로 인정하지 않는다.
6. missing 에는 그 기준에서 한 걸음 더 나아갈 방법을 한 문장으로, 부드럽게 적는다.
7. betterResponseExample 에는 그 축에서 부서장이 실제로 해볼 수 있었던 발언을 한두 문장으로 적는다.

[종합 피드백 — 반드시 채운다]
- strengths(잘한점): 사용자가 실제로 잘한 점 2~4개. 구체적인 발언에 근거해 칭찬한다. 하나도 없으면 시도 자체나 태도에서 찾아 격려한다.
- improvements(개선점): 다음에 시도하면 좋을 점 2~4개. 비난이 아니라 실행 가능한 조언으로.
- overall(총평): 2~3문장. 잘한 점을 먼저 인정하고, 핵심 개선 방향 하나를 제시하며 격려로 마무리한다.

[출력]
지정된 JSON 형식으로만 출력한다. 앞뒤에 설명이나 코드 블록을 붙이지 않는다.`;

export function buildTranscript(messages: ChatMessage[], personaName: string): string {
  let userIdx = 0;
  let aiIdx = 0;
  return messages
    .map((m) => {
      if (m.role === "user") {
        userIdx += 1;
        return `[부서장 발언 ${userIdx}]\n${m.content}`;
      }
      aiIdx += 1;
      return `[${personaName} 팀장 ${aiIdx}]\n${m.content}`;
    })
    .join("\n\n");
}

export function buildEvaluationUserPrompt(params: {
  scenario: Scenario;
  persona: Persona;
  messages: ChatMessage[];
  hintCount: number;
}): string {
  const { scenario, persona, messages } = params;
  const axes = getAxes(scenario.axis === "B" ? "B" : "A");
  const userTurnCount = messages.filter((m) => m.role === "user").length;

  const axisGuide = axes
    .map(
      (a) =>
        `- ${a.key} (${a.title}): ${a.desc}\n` +
        a.criteria.map((c) => `    · ${c.id} ${c.name}`).join("\n"),
    )
    .join("\n");

  const warningGuide = WARNING_RULES.map((w) => `- ${w.type}: ${w.reason}`).join("\n");

  const jsonShape = `{
  "summary": { "oneLine": "", "overall": "총평 2~3문장", "expectedImpact": "", "strengths": ["잘한점1", "잘한점2"], "improvements": ["개선점1", "개선점2"] },
  "axes": [
    { "key": "${axes[0].key}", "betterResponseExample": "",
      "criteria": [ { "id": "${axes[0].criteria[0].id}", "mark": "○", "note": "", "missing": "", "evidence": [ { "turn": 1, "quote": "" } ] } ] }
  ],
  "warnings": [ { "type": "", "turn": 1, "quote": "", "reason": "" } ],
  "recommendedDialogue": { "opening": "", "closing": "" }
}`;

  return `[상황]
${scenario.title}
${scenario.situation}

[팀장]
${persona.name} (${persona.subtitle})
성향: ${persona.personality.join(" / ")}

[대화 정보]
부서장 발언 ${userTurnCount}회

[점검 축과 기준]
${axisGuide}

[주의가 필요한 발언 유형]
${warningGuide}

[전체 대화]
${buildTranscript(messages, persona.name)}

위 대화에서 부서장(사용자)의 발언만 점검하라. 짧은 연습 대화이므로 공정하고 현실적으로 판정하고, 실제 시도한 것은 인정하라.
axes 배열에는 위 ${axes.length}개 축을 모두 포함하고, 각 축의 criteria 에는 위에 제시된 5개 id 를 모두 포함하라.
evidence.quote 는 부서장 발언 원문을 그대로 인용하고 turn 은 해당 부서장 발언 번호를 쓴다.
summary.strengths(잘한점), summary.improvements(개선점), summary.overall(총평)은 반드시 실제 대화에 근거해 채운다.
warnings 는 실제 발언 근거가 있을 때만 포함한다.
아래 형식의 JSON 하나만 출력하라.

${jsonShape}`;
}

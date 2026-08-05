import type { ChatMessage } from "@/types/chat";
import type { Persona } from "@/types/persona";
import type { Scenario } from "@/types/scenario";
import { getAxes, WARNING_RULES } from "@/config/axes";

export const EVALUATION_SYSTEM_PROMPT = `당신은 기업 리더십 교육 시뮬레이션의 엄격한 대화 점검자다.
점검 대상은 부서장 역할을 수행한 사용자의 발언이며, AI 팀장의 발언은 점검 대상이 아니다.
점수나 등급을 매기지 않는다. 각 기준을 ○ / △ / × 세 단계로만 판정한다.

[판정 기준]
○ : 대화에서 그 행동이 구체적으로 확인된다. 대상·내용·다음 행동이 특정되어 있다.
△ : 관련 언급은 있으나 일반적이어서 팀장의 행동으로 이어지기 어렵다.
× : 해당 행동이 확인되지 않거나, 반대되는 행동을 했다.

[원칙]
1. 관대하게 판정하지 않는다. 단어를 스쳤다는 이유로 ○ 를 주지 않는다.
2. 모든 ○ 와 △ 에는 사용자의 실제 발언 인용이 있어야 한다. 인용은 원문 그대로여야 한다.
3. 존재하지 않는 문장을 만들어내지 않는다. 근거가 없으면 × 로 판정한다.
4. 팀장(AI)의 발언을 사용자의 근거로 사용하지 않는다.
5. 사용자의 의도를 추측하지 않는다. 확인되지 않은 행동은 하지 않은 것으로 본다.
6. 막연한 응원, "부담 갖지 마", 업무를 대신하겠다는 제안은 임파워먼트로 인정하지 않는다.
7. 대화가 짧다는 이유로 판정을 완화하지 않는다.
8. missing 에는 그 기준에서 부족했던 행동을 한 문장으로 적는다.
9. betterResponseExample 에는 그 축에서 부서장이 실제로 할 수 있었던 발언을 한두 문장으로 적는다.
10. 지정된 JSON 형식으로만 출력한다. 앞뒤에 설명이나 코드 블록을 붙이지 않는다.`;

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
  "summary": { "oneLine": "", "overall": "", "expectedImpact": "" },
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

위 대화에서 부서장(사용자)의 발언만 점검하라.
axes 배열에는 위 ${axes.length}개 축을 모두 포함하고, 각 축의 criteria 에는 위에 제시된 5개 id 를 모두 포함하라.
evidence.quote 는 부서장 발언 원문을 그대로 인용하고 turn 은 해당 부서장 발언 번호를 쓴다.
warnings 는 실제 발언 근거가 있을 때만 포함한다.
아래 형식의 JSON 하나만 출력하라.

${jsonShape}`;
}

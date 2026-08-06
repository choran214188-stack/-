import { NextResponse } from "next/server";
import { customPersonaSchema, customScenarioSchema, toPersona, toScenario } from "@/lib/custom";
import { getPersona, DEFAULT_PERSONA_ID } from "@/config/personas";
import { getScenario, DEFAULT_SCENARIO_ID } from "@/config/scenarios";
import { getOpening } from "@/config/openings";
import { getProvider } from "@/lib/llm";
import { createId } from "@/lib/utils/format-time";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    scenarioId?: string;
    personaId?: string;
    customPersona?: unknown;
    customScenario?: unknown;
  } = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsedScenario = customScenarioSchema.safeParse(body.customScenario);
  const parsedPersona = customPersonaSchema.safeParse(body.customPersona);
  const scenario = parsedScenario.success
    ? toScenario(parsedScenario.data)
    : getScenario(body.scenarioId ?? DEFAULT_SCENARIO_ID);
  const persona = parsedPersona.success
    ? toPersona(parsedPersona.data)
    : getPersona(body.personaId ?? scenario.personaId ?? DEFAULT_PERSONA_ID);
  const provider = getProvider("chat");

  let opening = getOpening(scenario, persona);

  // 직접 입력한 상황에서 첫 메시지를 비워두면 LLM 이 상황에 맞게 생성한다.
  if (opening.length === 0) {
    if (provider.isMock) {
      opening = [
        `${scenario.title} 건으로 말씀 좀 드리고 싶습니다.`,
        "지금 상태로는 제가 계속 맡는 게 맞는지 잘 모르겠습니다.",
      ];
    } else {
      try {
        const text = await provider.complete({
          system:
            "당신은 기업 리더십 교육 시뮬레이션의 팀장 역할이다. 상사인 부서장과의 면담을 시작하며 팀장이 먼저 꺼내는 첫 메시지를 작성한다.",
          messages: [
            {
              role: "user",
              content: `[상황]
${scenario.situation}

[팀장]
이름: ${persona.name}${persona.subtitle ? ` (${persona.subtitle})` : ""}
성격: ${persona.personality.join(" / ")}

위 상황을 실제로 겪고 있는 팀장이, 이 성격 그대로 면담을 시작하며 먼저 꺼낼 말을 2문장으로 작성하라.
- 상황의 구체적인 사실을 자연스럽게 드러낼 것 (막연하게 시작하지 말 것)
- 성격이 말투에 드러나게 할 것
- 회사 메신저에서 쓸 법한 자연스러운 존댓말
- 각 문장을 줄바꿈으로 구분하고, 설명·따옴표·이모지·목록 없이 대사만 출력`,
            },
          ],
          maxTokens: 300,
          temperature: 0.9,
        });
        opening = text
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
          .slice(0, 3);
      } catch (error) {
        console.error("[api/simulation/start] opening generation failed", error);
        opening = [`${scenario.title} 건으로 말씀 좀 드리고 싶습니다.`];
      }
    }
  }

  return NextResponse.json({
    sessionId: createId("sess"),
    persona,
    scenario,
    openingMessage: [persona.greeting, ...opening],
    mock: provider.isMock,
  });
}

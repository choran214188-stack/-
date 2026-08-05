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
  const provider = getProvider();

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
            "당신은 기업 리더십 교육 시뮬레이션의 팀장 역할이다. 부서장과의 면담을 시작하는 첫 메시지를 작성한다.",
          messages: [
            {
              role: "user",
              content: `상황: ${scenario.situation}
팀장: ${persona.name} (${persona.tagline || persona.subtitle})
성향: ${persona.personality.join(" / ")}

이 팀장이 면담을 시작하며 먼저 꺼낼 말을 2문장으로 작성하라. 각 문장을 줄바꿈으로 구분하고, 설명이나 따옴표 없이 대사만 출력하라. 이모지와 목록을 쓰지 않는다.`,
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

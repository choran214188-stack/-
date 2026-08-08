import { NextResponse } from "next/server";
import { z } from "zod";
import { getScenario } from "@/config/scenarios";
import { buildMockReview, normalizeReview } from "@/lib/evaluation/review";
import { customPersonaSchema, customScenarioSchema, toScenario } from "@/lib/custom";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({
  sessionId: z.string().optional(),
  scenarioId: z.string().optional(),
  personaId: z.string().optional(),
  customPersona: customPersonaSchema.optional(),
  customScenario: customScenarioSchema.optional(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      turn: z.number(),
      createdAt: z.string(),
    }),
  ),
  hintCount: z.number().default(0),
});

/**
 * 평가는 규칙 기반(키워드/구조)으로 수행한다. LLM 을 사용하지 않는다.
 * - 서버가 부서장 발언을 축·기준별로 확인하고 근거 인용을 재검증한다.
 * - 어떤 사례(고정 팀장/직접 입력)가 와도 동일한 축으로 채점한다.
 */
export async function POST(request: Request) {
  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(parsedBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const { messages, hintCount, scenarioId, customScenario } = parsed.data;
  const scenario = customScenario ? toScenario(customScenario) : getScenario(scenarioId);
  const chatMessages = messages as ChatMessage[];

  const raw = buildMockReview(chatMessages, scenario);
  const evaluation = normalizeReview({
    raw,
    messages: chatMessages,
    scenario,
    hintCount,
    mock: true,
  });
  return NextResponse.json({ evaluation });
}

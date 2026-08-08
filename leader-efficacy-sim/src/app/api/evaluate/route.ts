import { NextResponse } from "next/server";
import { z } from "zod";
import { buildReview } from "@/lib/evaluation/score";
import { customPersonaSchema, customScenarioSchema } from "@/lib/custom";
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
 * 6개 항목(언어적 설득 3 · 정서적 각성 3), 각 1~5점, 총 30점.
 * 상황·페르소나에 상관없이 동일한 범용 루브릭으로 채점한다.
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

  const { messages, hintCount } = parsed.data;
  const evaluation = buildReview({ messages: messages as ChatMessage[], hintCount });
  return NextResponse.json({ evaluation });
}

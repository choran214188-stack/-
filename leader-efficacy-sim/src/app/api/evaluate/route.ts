import { NextResponse } from "next/server";
import { z } from "zod";
import { getPersona } from "@/config/personas";
import { getScenario } from "@/config/scenarios";
import { getProvider, LlmError } from "@/lib/llm";
import {
  EVALUATION_SYSTEM_PROMPT,
  buildEvaluationUserPrompt,
} from "@/lib/prompts/evaluation-prompt";
import { reviewSchema, extractJson, type RawReview } from "@/lib/evaluation/schema";
import { buildMockReview, normalizeReview } from "@/lib/evaluation/review";
import {
  customPersonaSchema,
  customScenarioSchema,
  toPersona,
  toScenario,
} from "@/lib/custom";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

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

  const { messages, hintCount, scenarioId, personaId, customPersona, customScenario } = parsed.data;
  const scenario = customScenario ? toScenario(customScenario) : getScenario(scenarioId);
  const persona = customPersona
    ? toPersona(customPersona)
    : getPersona(personaId ?? scenario.personaId);
  const provider = getProvider("evaluate");
  const chatMessages = messages as ChatMessage[];

  if (provider.isMock) {
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

  const userPrompt = buildEvaluationUserPrompt({ scenario, persona, messages: chatMessages, hintCount });

  const attempt = async (extra?: string): Promise<RawReview> => {
    const text = await provider.complete({
      system: EVALUATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: extra ? `${userPrompt}\n\n${extra}` : userPrompt }],
      maxTokens: 8000,
      temperature: 0.2,
      jsonMode: true,
    });
    return reviewSchema.parse(extractJson(text));
  };

  try {
    let raw: RawReview;
    try {
      raw = await attempt();
    } catch (firstError) {
      console.error("[api/evaluate] first attempt failed", firstError);
      raw = await attempt(
        "이전 출력이 지정된 JSON 스키마와 일치하지 않았다. 설명 없이 유효한 JSON 객체 하나만 다시 출력하라.",
      );
    }
    const evaluation = normalizeReview({
      raw,
      messages: chatMessages,
      scenario,
      hintCount,
      mock: false,
    });
    return NextResponse.json({ evaluation });
  } catch (error) {
    const code = error instanceof LlmError ? error.code : "invalid_review";
    console.error("[api/evaluate] failed, falling back to keyword review", code, error);
    // 실제 모델 평가가 실패해도 리포트는 항상 생성한다(키워드 기반 안전망).
    try {
      const raw = buildMockReview(chatMessages, scenario);
      const evaluation = normalizeReview({
        raw,
        messages: chatMessages,
        scenario,
        hintCount,
        mock: true,
      });
      return NextResponse.json({ evaluation });
    } catch (fallbackError) {
      console.error("[api/evaluate] fallback failed", fallbackError);
      return NextResponse.json(
        { error: "점검 결과를 생성하지 못했습니다. 대화는 그대로 남아 있으니 다시 시도해주세요." },
        { status: 502 },
      );
    }
  }
}

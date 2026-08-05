import { NextResponse } from "next/server";
import { z } from "zod";
import { getPersona } from "@/config/personas";
import { getScenario } from "@/config/scenarios";
import { getProvider, mockRoleplayReply, LlmError, type LlmMessage } from "@/lib/llm";
import { customPersonaSchema, customScenarioSchema, toPersona, toScenario } from "@/lib/custom";
import { buildRoleplaySystemPrompt } from "@/lib/prompts/roleplay-prompt";
import type { ChatMessage } from "@/types/chat";

export const runtime = "nodejs";

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
  userTurnCount: z.number().optional(),
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

  const { messages, scenarioId, personaId, customPersona, customScenario } = parsed.data;
  const scenario = customScenario ? toScenario(customScenario) : getScenario(scenarioId);
  const persona = customPersona
    ? toPersona(customPersona)
    : getPersona(personaId ?? scenario.personaId);
  const userTurnCount =
    parsed.data.userTurnCount ?? messages.filter((m) => m.role === "user").length;

  const provider = getProvider();
  const createdAt = new Date().toISOString();

  if (provider.isMock) {
    const reply = mockRoleplayReply(messages as ChatMessage[], scenario, persona);
    return NextResponse.json({ reply, createdAt, userTurnCount, mock: true });
  }

  const system = buildRoleplaySystemPrompt({
    persona,
    scenario,
    userTurnCount,
    maxUserTurns: scenario.maxUserTurns,
  });

  const llmMessages: LlmMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
  if (llmMessages.length === 0 || llmMessages[0].role !== "user") {
    llmMessages.unshift({ role: "user", content: "(면담 시작)" });
  }

  try {
    const reply = await provider.complete({
      system,
      messages: llmMessages,
      maxTokens: 400,
      temperature: 0.85,
    });
    return NextResponse.json({ reply: reply.trim(), createdAt, userTurnCount, mock: false });
  } catch (error) {
    const code = error instanceof LlmError ? error.code : "unknown_error";
    console.error("[api/chat] failed", code, error);
    return NextResponse.json(
      { error: "팀장의 응답을 받지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 502 },
    );
  }
}

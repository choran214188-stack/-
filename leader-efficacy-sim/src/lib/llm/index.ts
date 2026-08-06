import { AnthropicProvider } from "./anthropic-provider";
import { OpenAIProvider } from "./openai-provider";
import { MockProvider } from "./mock-provider";
import type { LlmProvider } from "./provider";

/** 대화(연기)와 평가(채점)에 서로 다른 모델을 쓸 수 있도록 작업 종류를 구분한다. */
export type LlmTask = "chat" | "evaluate";

function resolveProvider(providerName: string, model: string | undefined): LlmProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (providerName === "mock") return new MockProvider();
  if (providerName === "openai") {
    return openaiKey ? new OpenAIProvider(openaiKey, model) : new MockProvider();
  }
  if (providerName === "anthropic") {
    return anthropicKey ? new AnthropicProvider(anthropicKey, model) : new MockProvider();
  }
  return new MockProvider();
}

/**
 * 환경변수 기준으로 Provider 를 선택한다.
 *
 * 작업별(대화/평가) 오버라이드:
 *   - CHAT_PROVIDER / CHAT_MODEL       (대화)
 *   - EVAL_PROVIDER / EVAL_MODEL       (평가)
 * 공통:
 *   - LLM_PROVIDER (anthropic | openai | mock)
 *   - OPENAI_API_KEY / OPENAI_MODEL (기본 gpt-4o-mini)
 *   - ANTHROPIC_API_KEY / ANTHROPIC_MODEL (기본 claude-sonnet-5)
 *
 * provider 를 명시하지 않으면 설정된 Key 를 자동 감지(OpenAI → Anthropic)하고,
 * 사용할 수 있는 Key 가 없으면 Mock 으로 동작한다.
 */
export function getProvider(task?: LlmTask): LlmProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  const taskProvider =
    task === "chat"
      ? process.env.CHAT_PROVIDER
      : task === "evaluate"
        ? process.env.EVAL_PROVIDER
        : undefined;
  const taskModel =
    task === "chat"
      ? process.env.CHAT_MODEL
      : task === "evaluate"
        ? process.env.EVAL_MODEL
        : undefined;

  const providerName = (taskProvider || process.env.LLM_PROVIDER || "").toLowerCase();

  if (providerName) {
    // provider 가 openai/anthropic 인데 작업별 모델이 없으면 provider 기본 모델을 쓴다.
    const model =
      taskModel ||
      (providerName === "openai"
        ? process.env.OPENAI_MODEL
        : providerName === "anthropic"
          ? process.env.ANTHROPIC_MODEL
          : undefined);
    return resolveProvider(providerName, model);
  }

  // provider 미지정: 설정된 Key 자동 감지 (OpenAI → Anthropic)
  if (openaiKey) return resolveProvider("openai", taskModel || process.env.OPENAI_MODEL);
  if (anthropicKey) return resolveProvider("anthropic", taskModel || process.env.ANTHROPIC_MODEL);
  return new MockProvider();
}

export * from "./provider";
export { mockRoleplayReply, classifyUserMessage } from "./mock-provider";

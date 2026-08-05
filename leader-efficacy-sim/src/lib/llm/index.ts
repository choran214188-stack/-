import { AnthropicProvider } from "./anthropic-provider";
import { OpenAIProvider } from "./openai-provider";
import { MockProvider } from "./mock-provider";
import type { LlmProvider } from "./provider";

/**
 * 환경변수 기준으로 Provider 를 선택한다.
 * - LLM_PROVIDER 로 명시(anthropic | openai | mock)하거나,
 * - 미지정 시 설정된 API Key 를 자동 감지한다.
 * - 사용할 수 있는 Key 가 없으면 Mock 모드로 동작한다.
 */
export function getProvider(): LlmProvider {
  const configured = (process.env.LLM_PROVIDER || "").toLowerCase();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();

  if (configured === "mock") return new MockProvider();

  if (configured === "openai") {
    if (openaiKey) return new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL);
    return new MockProvider();
  }

  if (configured === "anthropic") {
    if (anthropicKey) return new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL);
    return new MockProvider();
  }

  // 미지정: 설정된 Key 를 자동 감지 (OpenAI → Anthropic 순)
  if (openaiKey) return new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL);
  if (anthropicKey) return new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL);
  return new MockProvider();
}

export * from "./provider";
export { mockRoleplayReply, classifyUserMessage } from "./mock-provider";

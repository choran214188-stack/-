import { AnthropicProvider } from "./anthropic-provider";
import { MockProvider } from "./mock-provider";
import type { LlmProvider } from "./provider";

/** 환경변수 기준으로 Provider 를 선택한다. Key 가 없으면 Mock Mode 로 동작한다. */
export function getProvider(): LlmProvider {
  const configured = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (configured === "mock") return new MockProvider();
  if (configured === "anthropic" && apiKey) {
    return new AnthropicProvider(apiKey, process.env.ANTHROPIC_MODEL);
  }
  return new MockProvider();
}

export * from "./provider";
export { mockRoleplayReply, classifyUserMessage } from "./mock-provider";

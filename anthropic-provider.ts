import { LlmError, type CompletionRequest, type LlmProvider } from "./provider";

const API_URL = "https://api.anthropic.com/v1/messages";

type AnthropicContentBlock = { type: string; text?: string };
type AnthropicResponse = { content?: AnthropicContentBlock[] };

export class AnthropicProvider implements LlmProvider {
  readonly name = "anthropic";
  readonly isMock = false;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "claude-sonnet-5";
  }

  async complete({ system, messages, maxTokens, temperature }: CompletionRequest): Promise<string> {
    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.8,
          system,
          messages,
        }),
      });
    } catch {
      throw new LlmError("network_error", "LLM 서버에 연결하지 못했습니다.");
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      // 상세 오류는 서버 로그에만 남긴다.
      console.error("[anthropic-provider] request failed", response.status, detail.slice(0, 500));
      throw new LlmError("upstream_error", "LLM 응답을 받지 못했습니다.");
    }

    const data = (await response.json()) as AnthropicResponse;
    const text = (data.content ?? [])
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text as string)
      .join("\n")
      .trim();

    if (!text) throw new LlmError("empty_response", "LLM 응답이 비어 있습니다.");
    return text;
  }
}

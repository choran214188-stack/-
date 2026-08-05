import { LlmError, type CompletionRequest, type LlmProvider } from "./provider";

const API_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIChoice = { message?: { content?: string } };
type OpenAIResponse = { choices?: OpenAIChoice[] };

/** OpenAI Chat Completions (GPT) provider. */
export class OpenAIProvider implements LlmProvider {
  readonly name = "openai";
  readonly isMock = false;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "gpt-4o-mini";
  }

  async complete({ system, messages, maxTokens, temperature }: CompletionRequest): Promise<string> {
    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.8,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
    } catch {
      throw new LlmError("network_error", "LLM 서버에 연결하지 못했습니다.");
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[openai-provider] request failed", response.status, detail.slice(0, 500));
      throw new LlmError("upstream_error", "LLM 응답을 받지 못했습니다.");
    }

    const data = (await response.json()) as OpenAIResponse;
    const text = (data.choices?.[0]?.message?.content ?? "").trim();

    if (!text) throw new LlmError("empty_response", "LLM 응답이 비어 있습니다.");
    return text;
  }
}

export type LlmMessage = { role: "user" | "assistant"; content: string };

export type CompletionRequest = {
  system: string;
  messages: LlmMessage[];
  maxTokens?: number;
  temperature?: number;
  /** JSON 객체만 출력하도록 강제 (지원하는 provider 에서만 적용) */
  jsonMode?: boolean;
};

export interface LlmProvider {
  /** provider 식별자 */
  readonly name: string;
  /** API Key 없이 동작하는 Mock 여부 */
  readonly isMock: boolean;
  complete(request: CompletionRequest): Promise<string>;
}

export class LlmError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = "LlmError";
  }
}

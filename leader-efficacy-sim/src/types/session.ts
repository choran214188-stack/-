import type { ChatMessage } from "./chat";
import type { ReviewResult } from "./evaluation";

export type SessionStatus = "ready" | "in_progress" | "evaluating" | "completed";

export type SimulationSession = {
  id: string;
  scenarioId: string;
  personaId: string;
  status: SessionStatus;
  messages: ChatMessage[];
  userTurnCount: number;
  hintCount: number;
  startedAt: string;
  completedAt?: string;
  evaluation?: ReviewResult;
  customPersonaId?: string;
  mock?: boolean;
};

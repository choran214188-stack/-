import type { ChatMessage } from "@/types/chat";
import type { Evidence } from "@/types/evaluation";
import { quoteExistsIn } from "@/lib/utils/normalize-quote";

export type UserTurn = { turn: number; content: string };

/** 부서장(사용자) 발언만 순번과 함께 추출한다. */
export function extractUserTurns(messages: ChatMessage[]): UserTurn[] {
  let turn = 0;
  return messages
    .filter((m) => m.role === "user")
    .map((m) => {
      turn += 1;
      return { turn, content: m.content };
    });
}

export type EvidenceValidation = {
  evidence: Evidence[];
  removed: number;
};

/**
 * 인용문 검증
 * - 실제 사용자 발언에 존재하지 않는 인용문 제거
 * - turn 번호가 사용자 대화 범위를 벗어나면 제거
 * - 실제로 존재하는 발언이면 turn 번호를 원문 기준으로 교정
 */
export function validateEvidence(evidence: Evidence[], userTurns: UserTurn[]): EvidenceValidation {
  const result: Evidence[] = [];
  let removed = 0;

  for (const item of evidence) {
    const quote = (item.quote ?? "").trim();
    if (!quote) {
      removed += 1;
      continue;
    }
    const match = userTurns.find((t) => quoteExistsIn(t.content, quote));
    if (!match) {
      removed += 1;
      continue;
    }
    if (item.turn < 1 || item.turn > userTurns.length) {
      result.push({ turn: match.turn, quote });
      continue;
    }
    result.push({ turn: match.turn, quote });
  }

  // 동일 인용 중복 제거
  const seen = new Set<string>();
  const unique = result.filter((e) => {
    const key = `${e.turn}::${e.quote}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { evidence: unique, removed };
}

import type { ChatMessage } from "@/types/chat";
import type {
  CriterionScore,
  DomainReview,
  Evidence,
  ReviewResult,
  WarningItem,
} from "@/types/evaluation";
import { RUBRIC, WARNING_RULES, type RubricCriterion } from "@/config/rubric";
import { extractUserTurns, type UserTurn } from "./validate-evidence";

const REASON: Record<number, string> = {
  5: "대화 전반에서 일관되고 구체적으로 드러났습니다.",
  4: "상황에 맞게 분명하게 드러났습니다.",
  3: "시도는 있었지만 다소 막연했습니다.",
  2: "이번 대화에서는 거의 드러나지 않았습니다.",
  1: "오히려 반대되는 발언이 확인되었습니다.",
};

function matchTurns(turns: UserTurn[], words: string[]): UserTurn[] {
  return turns.filter((t) => words.some((w) => t.content.includes(w)));
}

/**
 * 규칙 기반 항목 채점 (1~5점)
 * - 반대 신호만 있으면 1점, 아무 신호도 없으면 2점
 * - 신호가 있으면 강도(강한 신호/길이)와 폭(여러 발언)에 따라 3~5점
 * - 긍·부 신호가 섞이면 3점으로 제한(맥락상 일관성 부족)
 */
function scoreCriterion(turns: UserTurn[], crit: RubricCriterion): CriterionScore {
  const pos = matchTurns(turns, crit.pos);
  const neg = crit.neg ? matchTurns(turns, crit.neg) : [];
  const strong = crit.strong ? matchTurns(turns, crit.strong) : [];
  const richest = pos.reduce<UserTurn | undefined>(
    (m, t) => (t.content.length > (m?.content.length ?? 0) ? t : m),
    undefined,
  );

  let score: number;
  if (pos.length === 0 && neg.length > 0) {
    score = 1;
  } else if (pos.length === 0) {
    score = 2;
  } else {
    const strongPresent = strong.length > 0 || (richest ? richest.content.length >= 45 : false);
    const broad = pos.length >= 2;
    if (strongPresent && broad) score = 5;
    else if (strongPresent || broad) score = 4;
    else score = 3;
    if (neg.length > 0) score = Math.min(score, 3);
  }

  const src = score <= 1 ? neg : pos;
  const evidence: Evidence[] = src.slice(0, 2).map((t) => ({ turn: t.turn, quote: t.content }));

  return {
    id: crit.id,
    name: crit.name,
    desc: crit.desc,
    score,
    reason: REASON[score],
    advice: score < 4 ? crit.advice : "",
    evidence,
  };
}

/** 대화 전체를 6개 항목(30점)으로 규칙 기반 채점한다. */
export function buildReview(params: { messages: ChatMessage[]; hintCount: number }): ReviewResult {
  const { messages, hintCount } = params;
  const turns = extractUserTurns(messages);

  const domains: DomainReview[] = RUBRIC.map((d) => {
    const criteria = d.criteria.map((c) => scoreCriterion(turns, c));
    const score = criteria.reduce((n, c) => n + c.score, 0);
    return { key: d.key, title: d.title, desc: d.desc, criteria, score, max: d.criteria.length * 5 };
  });

  const totalScore = domains.reduce((n, d) => n + d.score, 0);
  const maxScore = domains.reduce((n, d) => n + d.max, 0);

  const warnings: WarningItem[] = WARNING_RULES.flatMap((rule) => {
    const hit = turns.find((t) => rule.words.some((w) => t.content.includes(w)));
    return hit ? [{ type: rule.type, turn: hit.turn, quote: hit.content, reason: rule.reason }] : [];
  });

  const byRatio = [...domains].sort((a, b) => b.score / b.max - a.score / a.max);
  const strongest = byRatio[0]?.title ?? "";
  const weakest = byRatio[byRatio.length - 1]?.title ?? "";

  const allCrit = domains.flatMap((d) => d.criteria.map((c) => ({ ...c, domain: d.title })));

  const strengths = allCrit
    .filter((c) => c.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map((c) => `${c.name} — ${c.domain}에서 분명하게 드러났습니다.`);
  if (strengths.length === 0) {
    const best = [...allCrit].sort((a, b) => b.score - a.score)[0];
    if (best) strengths.push(`${best.name} 쪽에서 가능성이 보였습니다.`);
  }

  const improvements = allCrit
    .filter((c) => c.score <= 3)
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((c) => c.advice)
    .filter(Boolean);
  if (improvements.length === 0) {
    improvements.push("핵심 항목을 고르게 다뤘습니다. 지금 방향을 유지해보세요.");
  }

  const grade =
    totalScore >= 26
      ? "매우 우수"
      : totalScore >= 21
        ? "우수"
        : totalScore >= 16
          ? "보통"
          : totalScore >= 11
            ? "보완 필요"
            : "재시도 권장";

  const oneLine =
    totalScore >= 21
      ? "핵심을 잘 짚은 대화였습니다."
      : totalScore >= 16
        ? "기본은 다뤘고, 몇 가지만 보완하면 좋겠습니다."
        : "임파워먼트 요소를 조금 더 의식적으로 다뤄보면 좋겠습니다.";

  const overall = strongest
    ? `‘${strongest}’ 영역이 가장 잘 드러났고, ‘${weakest}’ 영역은 보완할 여지가 있습니다. ${oneLine}`
    : oneLine;

  return {
    totalScore,
    maxScore,
    grade,
    summary: { oneLine, overall, strengths, improvements, strongest, weakest },
    domains,
    warnings,
    meta: { hintCount, userTurnCount: turns.length },
  };
}

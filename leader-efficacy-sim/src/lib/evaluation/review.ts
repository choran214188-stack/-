import type { ChatMessage } from "@/types/chat";
import type { Scenario } from "@/types/scenario";
import type {
  AxisReview,
  CriterionReview,
  Mark,
  ReviewResult,
  WarningItem,
} from "@/types/evaluation";
import { getAxes, WARNING_RULES, type AxisDef } from "@/config/axes";
import { quoteExistsIn } from "@/lib/utils/normalize-quote";
import { extractUserTurns, validateEvidence, type UserTurn } from "./validate-evidence";
import type { RawReview } from "./schema";

const NOTE: Record<Mark, string> = {
  "○": "대화에서 구체적으로 확인되었습니다.",
  "△": "언급은 있었지만 구체성이 부족합니다.",
  "×": "대화에서 확인되지 않았습니다.",
};

function countMarks(criteria: CriterionReview[]) {
  return {
    ok: criteria.filter((c) => c.mark === "○").length,
    part: criteria.filter((c) => c.mark === "△").length,
    none: criteria.filter((c) => c.mark === "×").length,
  };
}

function buildSummary(axes: AxisReview[]) {
  const done = axes.reduce((n, a) => n + a.counts.ok, 0);
  const partial = axes.reduce((n, a) => n + a.counts.part, 0);
  const total = axes.reduce((n, a) => n + a.criteria.length, 0);
  const score = (a: AxisReview) => a.counts.ok * 2 + a.counts.part;
  const sorted = [...axes].sort((x, y) => score(y) - score(x));
  return {
    done,
    partial,
    missing: total - done - partial,
    strongest: sorted[0]?.title ?? "",
    weakest: sorted[sorted.length - 1]?.title ?? "",
    oneLine:
      done >= total * 0.6
        ? "네 축을 고르게 다뤘습니다. 남은 항목만 보완하면 됩니다."
        : done >= total * 0.3
          ? "일부 축은 다뤘지만 아직 비어 있는 영역이 있습니다."
          : "대화가 특정 방향에 치우쳐 있습니다. 비어 있는 축부터 보완해보십시오.",
  };
}

function validateWarnings(warnings: WarningItem[], userTurns: UserTurn[]) {
  const result: WarningItem[] = [];
  let removed = 0;
  for (const w of warnings) {
    const quote = (w.quote ?? "").trim();
    const match = quote ? userTurns.find((t) => quoteExistsIn(t.content, quote)) : undefined;
    if (!match) {
      removed += 1;
      continue;
    }
    result.push({ type: w.type || "주의", turn: match.turn, quote, reason: w.reason || "" });
  }
  return { warnings: result, removed };
}

/**
 * 서버 재검증: LLM 판정을 그대로 신뢰하지 않는다.
 * - 축과 기준 목록은 서버 정의를 기준으로 다시 맞춘다
 * - 근거 인용문이 실제 부서장 발언에 없으면 제거하고, 근거가 사라진 기준은 × 로 낮춘다
 * - 개수와 요약은 서버가 다시 계산한다
 */
export function normalizeReview(params: {
  raw: RawReview;
  messages: ChatMessage[];
  scenario: Scenario;
  hintCount: number;
  mock: boolean;
}): ReviewResult {
  const { raw, messages, scenario, hintCount, mock } = params;
  const axisSet = scenario.axis === "B" ? "B" : "A";
  const defs = getAxes(axisSet);
  const userTurns = extractUserTurns(messages);
  let removedEvidenceCount = 0;

  const axes: AxisReview[] = defs.map((def) => {
    const rawAxis = raw.axes?.find((a) => a.key === def.key);
    const criteria: CriterionReview[] = def.criteria.map((cd) => {
      const rawCriterion = rawAxis?.criteria?.find((c) => c.id === cd.id);
      const { evidence, removed } = validateEvidence(rawCriterion?.evidence ?? [], userTurns);
      removedEvidenceCount += removed;
      let mark: Mark = rawCriterion?.mark ?? "×";
      if (evidence.length === 0) mark = "×";
      return {
        id: cd.id,
        name: cd.name,
        mark,
        note: rawCriterion?.note?.trim() || NOTE[mark],
        evidence,
        missing: mark === "○" ? "" : rawCriterion?.missing?.trim() || cd.missing,
      };
    });

    return {
      key: def.key,
      title: def.title,
      desc: def.desc,
      criteria,
      counts: countMarks(criteria),
      betterResponseExample:
        rawAxis?.betterResponseExample?.trim() || scenario.coach?.[def.coachKey] || "",
    };
  });

  const { warnings, removed: removedWarningCount } = validateWarnings(
    (raw.warnings ?? []) as WarningItem[],
    userTurns,
  );
  const s = buildSummary(axes);

  return {
    summary: {
      oneLine: raw.summary?.oneLine?.trim() || s.oneLine,
      overall: raw.summary?.overall ?? "",
      expectedImpact: raw.summary?.expectedImpact ?? "",
      strongest: s.strongest,
      weakest: s.weakest,
      counts: { done: s.done, partial: s.partial, missing: s.missing },
    },
    axes,
    warnings,
    recommendedDialogue: {
      opening: raw.recommendedDialogue?.opening || scenario.coach?.opening || "",
      closing: raw.recommendedDialogue?.closing || scenario.coach?.closing || "",
    },
    meta: {
      mock,
      hintCount,
      userTurnCount: userTurns.length,
      removedEvidenceCount,
      removedWarningCount,
      axisSet,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Mock Mode                                                           */
/* ------------------------------------------------------------------ */

function find(turns: UserTurn[], words: string[]): UserTurn | undefined {
  return turns.find((t) => words.some((w) => t.content.includes(w)));
}

/** API Key 없이 동작하는 키워드 기반 점검. 의미를 해석하지 않는다. */
export function buildMockReview(messages: ChatMessage[], scenario: Scenario): RawReview {
  const turns = extractUserTurns(messages);
  const defs: AxisDef[] = getAxes(scenario.axis === "B" ? "B" : "A");

  const axes = defs.map((def) => ({
    key: def.key,
    betterResponseExample: scenario.coach?.[def.coachKey] ?? "",
    criteria: def.criteria.map((c) => {
      const base = find(turns, c.words);
      const strong = c.strong ? find(turns, c.strong) : undefined;
      const src = strong ?? base;
      let mark: Mark = "×";
      if (src) {
        const hits = turns.filter((t) => c.words.some((w) => t.content.includes(w))).length;
        const rich = src.content.length >= 45 || hits >= 2;
        mark = strong || rich ? "○" : "△";
      }
      return {
        id: c.id,
        mark,
        note: NOTE[mark],
        evidence: src ? [{ turn: src.turn, quote: src.content }] : [],
        missing: mark === "○" ? "" : c.missing,
      };
    }),
  }));

  const warnings = WARNING_RULES.flatMap((rule) => {
    const hit = find(turns, rule.words);
    return hit ? [{ type: rule.type, turn: hit.turn, quote: hit.content, reason: rule.reason }] : [];
  });

  return {
    summary: {
      oneLine: "",
      overall: "",
      expectedImpact: "",
    },
    axes,
    warnings,
    recommendedDialogue: {
      opening: scenario.coach?.opening ?? "",
      closing: scenario.coach?.closing ?? "",
    },
  };
}

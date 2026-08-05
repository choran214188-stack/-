export type Mark = "○" | "△" | "×";

export type Evidence = { turn: number; quote: string };

export type CriterionReview = {
  id: string;
  name: string;
  mark: Mark;
  note: string;
  evidence: Evidence[];
  missing: string;
};

export type AxisReview = {
  key: string;
  title: string;
  desc: string;
  criteria: CriterionReview[];
  counts: { ok: number; part: number; none: number };
  betterResponseExample: string;
};

export type WarningItem = {
  type: string;
  turn: number;
  quote: string;
  reason: string;
};

export type ReviewResult = {
  summary: {
    oneLine: string;
    overall: string;
    expectedImpact: string;
    strongest: string;
    weakest: string;
    counts: { done: number; partial: number; missing: number };
  };
  axes: AxisReview[];
  warnings: WarningItem[];
  recommendedDialogue: { opening: string; closing: string };
  meta: {
    mock: boolean;
    hintCount: number;
    userTurnCount: number;
    removedEvidenceCount: number;
    removedWarningCount: number;
    axisSet: "A" | "B";
  };
};

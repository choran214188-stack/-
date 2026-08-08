export type Evidence = { turn: number; quote: string };

/** 개별 항목 채점 (1~5점) */
export type CriterionScore = {
  id: string;
  name: string;
  desc: string;
  score: number; // 1-5
  reason: string;
  advice: string; // 4점 미만일 때만 채워진다
  evidence: Evidence[];
};

/** 평가 영역 (언어적 설득 / 정서적 각성, 각 15점) */
export type DomainReview = {
  key: string;
  title: string;
  desc: string;
  score: number; // 3-15
  max: number; // 15
  criteria: CriterionScore[];
};

export type WarningItem = {
  type: string;
  turn: number;
  quote: string;
  reason: string;
};

export type ReviewResult = {
  totalScore: number; // 6-30 (원점수)
  maxScore: number; // 30
  score100: number; // 100점 환산 점수
  grade: string;
  summary: {
    oneLine: string;
    overall: string;
    strengths: string[];
    improvements: string[];
    strongest: string; // 가장 잘 다룬 영역
    weakest: string; // 가장 비어 있는 영역
  };
  domains: DomainReview[];
  warnings: WarningItem[];
  meta: {
    hintCount: number;
    userTurnCount: number;
  };
};

/** 축 coachKey → 개선 대화문. opening / closing 은 공통. */
export type ScenarioCoach = Record<string, string>;

export type Scenario = {
  id: string;
  title: string;
  /** 카드에 표시할 짧은 라벨 */
  label: string;
  summary: string;
  situation: string;
  /** 인사말 다음에 이어지는 팀장의 첫 메시지들 */
  opening: string[];
  currentState: string[];
  managerGoal: string[];
  recommendedUserTurns: number;
  maxUserTurns: number;
  hints: string[];
  /** 평가 보고서의 영역별 개선 대화문 */
  coach: ScenarioCoach;
  /** Mock Mode 전용 상황 응답 (의도 → 응답 후보) */
  mockReplies?: Record<string, string[]>;
  /** 이 시나리오에 기본으로 어울리는 페르소나 */
  personaId?: string;
  /** 점검 축 세트. B는 부서장 권한 밖 문제(보상·인정 불일치 등) */
  axis?: "A" | "B";
  /** 사용자가 직접 입력해 만든 상황인지 */
  custom?: boolean;
};

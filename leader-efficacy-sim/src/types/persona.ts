export type Persona = {
  id: string;
  name: string;
  profileImage?: string;
  position: string;
  subtitle: string;
  tenure: string;
  generationLabel: string;
  /** 난이도 (1: 하 ~ 4: 최상) */
  level: 1 | 2 | 3 | 4;
  levelLabel: string;
  /** 시작 화면 카드에 표시하는 한 줄 소개 */
  tagline: string;
  /** 상황과 무관한 첫 인사말. 이어지는 문장은 시나리오가 제공한다. */
  greeting: string;
  /** 성격에서 비롯되는 저항 방식 */
  resistancePatterns: string[];
  /** Mock Mode 전용 말투 응답 (의도 → 응답 후보) */
  mockReplies?: Record<string, string[]>;
  personality: string[];
  /** 사용자가 직접 입력해 만든 페르소나인지 */
  custom?: boolean;
  communicationStyle?: string[];
  emotionalState?: string[];
  mainConcern?: string;
  hiddenConcern?: string;
  confidenceLevel?: number;
  defensiveness?: number;
  receptiveness?: number;
  currentWorkload?: string;
  previousSuccesses?: string[];
  previousFailures?: string[];
  triggers?: string[];
  preferredSupportStyle?: string[];
  openingMessage?: string[];
};

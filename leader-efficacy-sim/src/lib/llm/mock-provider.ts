import type { ChatMessage } from "@/types/chat";
import type { Persona } from "@/types/persona";
import type { Scenario } from "@/types/scenario";
import { getTails } from "@/config/openings";
import type { CompletionRequest, LlmProvider } from "./provider";

export type UserIntent =
  | "vague_encouragement"
  | "emotion_ack"
  | "past_experience"
  | "case_example"
  | "concrete_support"
  | "directive_pressure"
  | "take_over"
  | "action_choice"
  | "follow_up"
  | "capability_feedback"
  | "question"
  | "other";

const KEYWORDS: Array<{ intent: UserIntent; words: string[] }> = [
  { intent: "take_over", words: ["내가 대신", "제가 대신", "대신 하겠", "대신하겠", "제가 맡", "내가 맡", "시키는 것만", "내가 하겠"] },
  { intent: "directive_pressure", words: ["해야 합니다", "하세요", "하라", "무조건", "지시", "반드시 해", "결과로 보여", "변명"] },
  { intent: "follow_up", words: ["점검", "다시 보", "주간", "격주", "다음 주", "중간에 확인", "follow", "리뷰하"] },
  { intent: "concrete_support", words: ["일정", "인력", "리소스", "자원", "권한", "의사결정", "보고 전", "검토", "조정", "지원", "예산", "범위"] },
  { intent: "case_example", words: ["사례", "다른 팀", "예를 들", "케이스", "비슷한 경우", "사례를"] },
  { intent: "past_experience", words: ["예전", "지난", "그때", "과거", "이전 프로젝트", "경험", "어떻게 하셨", "무엇을 했"] },
  { intent: "action_choice", words: ["먼저 무엇", "첫 번째로", "무엇부터", "어떤 것부터", "선택", "정해보", "어떻게 하고 싶"] },
  { intent: "capability_feedback", words: ["조율", "정리", "설계", "커뮤니케이션", "강점", "역량", "봤습니다", "보였습니다", "확인했습니다"] },
  { intent: "emotion_ack", words: ["힘드", "부담", "불안", "걱정", "어떤 점이", "어떤 부분이", "이해합니다", "그럴 수 있", "마음"] },
  { intent: "vague_encouragement", words: ["힘내", "잘될", "자신감", "할 수 있", "믿는다", "믿어", "괜찮아", "파이팅", "잘하잖"] },
];

export function classifyUserMessage(text: string): UserIntent {
  const t = text.replace(/\s+/g, " ");
  for (const { intent, words } of KEYWORDS) {
    if (words.some((w) => t.includes(w))) return intent;
  }
  if (t.includes("?") || t.includes("나요") || t.includes("까요")) return "question";
  return "other";
}

const REPLIES: Record<UserIntent, string[]> = {
  vague_encouragement: [
    "좋게 말씀해주시는 건 감사합니다. 다만 이번에는 실제로 결과가 좋지 않았고, 제가 다음 프로젝트를 잘할 수 있다는 근거가 무엇인지는 잘 모르겠습니다.",
    "그 말씀만으로는 제 판단이 달라지지 않습니다. 어떤 근거로 제가 해낼 수 있다고 보시는지 알려주시면 좋겠습니다.",
    "응원해주시는 마음은 알겠습니다. 그런데 지난번에도 자신은 있었는데 결과가 그랬습니다.",
  ],
  emotion_ack: [
    "솔직히 가장 부담스러운 건 경영진 보고입니다. 질문이 들어왔을 때 제가 답을 못 하는 장면이 계속 남아 있습니다.",
    "팀원들이 저를 어떻게 볼지도 신경이 쓰입니다. 방향에 불만이 있었던 것도 결국 제 책임이라고 생각합니다.",
    "그 부분을 물어봐주시니 조금 말씀드리기가 낫습니다. 지금은 업무량도 적지 않아서 여유가 없는 상태입니다.",
  ],
  past_experience: [
    "작년 물류 시스템 개선 과제 말씀이신가요. 그때는 부서별 요구사항을 하나씩 정리해서 일정 기준을 다시 잡았습니다.",
    "그때 제가 했던 방식 중에서 이번에도 활용할 수 있는 부분이 있다는 말씀이신가요?",
    "그 과제는 이해관계가 단순한 편이었습니다. 이번 프로젝트와 같은 수준으로 보기는 어렵지 않을까요.",
  ],
  case_example: [
    "그 사례가 제 상황과 어떤 점에서 비슷한지 잘 모르겠습니다. 그 팀장은 어떤 순서로 문제를 풀었습니까?",
    "결과만 들으면 저와는 조건이 다르게 느껴집니다. 중간에 어떤 판단을 했는지가 더 궁금합니다.",
    "그 방식 중에서 제 상황에 바로 적용할 수 있는 부분이 있다면 한 가지만 짚어주시면 좋겠습니다.",
  ],
  concrete_support: [
    "보고 전에 검토받을 수 있고 의사결정 범위가 명확해진다면 부담은 조금 줄어들 것 같습니다.",
    "일정 조정이 실제로 가능한 부분입니까? 어느 범위까지 제가 결정해도 되는지가 정리되면 좋겠습니다.",
    "그렇게 되면 제가 신경 쓸 지점이 줄어드는 건 맞습니다. 다만 인력 부분은 아직 확실하지 않아 보입니다.",
  ],
  directive_pressure: [
    "말씀하신 대로 진행할 수는 있습니다. 다만 그렇게 하면 제가 다시 주도적으로 해낼 수 있을지는 잘 모르겠습니다.",
    "해야 한다는 건 저도 알고 있습니다. 그런데 지금 제가 부담을 느끼는 이유를 먼저 이해해주셨으면 합니다.",
    "지시하신 내용은 확인했습니다. 그런데 제 의견은 어느 부분에서 반영될 수 있습니까?",
  ],
  take_over: [
    "부서장님께서 맡아주시면 당장은 편할 것 같습니다. 다만 다음에도 비슷한 상황이 생겼을 때 제가 직접 대응할 수 있을지는 모르겠습니다.",
    "그렇게 하면 이번 건은 넘어갈 수 있겠습니다. 그런데 그건 제가 팀장으로서 해야 할 일을 못 한다는 뜻이기도 합니다.",
    "대신 해주신다면 팀원들이 저를 어떻게 볼지도 생각하게 됩니다.",
  ],
  action_choice: [
    "굳이 먼저 한다면 이번 주 안에 지난 보고에서 막혔던 질문들을 정리해보는 것 정도는 할 수 있을 것 같습니다.",
    "먼저 무엇을 할지 정하라고 하시니 생각을 해보게 됩니다. 아직은 어디부터 손대야 할지 정리가 안 됩니다.",
    "제가 선택해도 되는 부분이 있다면, 팀원들과 방향을 먼저 맞추는 자리부터 잡고 싶습니다.",
  ],
  follow_up: [
    "중간에 한 번 점검하는 자리가 있다면 혼자 끌고 가는 느낌은 덜할 것 같습니다. 어느 시점이 좋겠습니까?",
    "격주로 확인하는 방식이면 저도 준비할 시간이 생깁니다. 그 자리에서 무엇을 보시는지가 정리되면 좋겠습니다.",
  ],
  capability_feedback: [
    "그렇게 봐주셨다는 건 몰랐습니다. 그 부분이 이번 프로젝트에서는 어떻게 쓰일 수 있다고 보십니까?",
    "제가 잘했다고 보신 지점이 구체적으로 어떤 장면이었는지 궁금합니다.",
  ],
  question: [
    "질문 주신 부분은 조금 더 생각해봐야 할 것 같습니다. 지금은 다음 프로젝트를 맡는 것 자체가 부담스럽습니다.",
    "그건 제가 정리해서 말씀드리기 어려운 부분입니다. 다만 지난 보고 이후로 판단이 잘 서지 않습니다.",
  ],
  other: [
    "말씀은 이해했습니다. 다만 제 상황이 실제로 어떻게 달라지는지는 아직 잘 모르겠습니다.",
    "그 부분은 조금 더 구체적으로 말씀해주시면 좋겠습니다.",
    "네, 듣고 있습니다. 그런데 결국 제가 다시 같은 실수를 하지 않을 수 있을지가 걱정입니다.",
  ],
};

const LATE_TURN_SUFFIX = [
  "남은 기간을 생각하면 결정은 빨리 해야 한다는 것도 알고 있습니다.",
  "이야기를 나누다 보니 제가 무엇을 정리해야 하는지는 조금 보이는 것 같습니다.",
];

/**
 * Mock 모드 팀장 응답 생성.
 * 응답 후보는 시나리오(상황) → 페르소나(말투) → 공통 순으로 조회하며 같은 문장을 반복하지 않는다.
 */
export function mockRoleplayReply(
  messages: ChatMessage[],
  scenario: Scenario,
  persona: Persona,
): string {
  const maxUserTurns = scenario.maxUserTurns;
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const intent = classifyUserMessage(lastUser?.content ?? "");
  const used = new Set(messages.filter((m) => m.role === "assistant").map((m) => m.content));
  // 상황이 만든 문장에는 페르소나 말투 꼬리를 붙여 조합마다 다른 문장을 만든다.
  const tails = getTails(persona, intent);
  const scenarioLines = (scenario.mockReplies?.[intent] ?? []).flatMap((line) =>
    tails.length > 0 ? tails.map((tail) => `${line} ${tail}`) : [line],
  );
  const pool = [...scenarioLines, ...(persona.mockReplies?.[intent] ?? []), ...REPLIES[intent]];
  const candidate = pool.find((r) => !used.has(r)) ?? REPLIES.other.find((r) => !used.has(r));
  let reply = candidate ?? "같은 이야기가 반복되는 것 같습니다. 조금 다른 관점으로 짚어주시면 좋겠습니다.";

  const userTurns = messages.filter((m) => m.role === "user").length;
  if (userTurns >= maxUserTurns - 2) {
    const suffix = LATE_TURN_SUFFIX.find((s) => !used.has(s));
    if (suffix) reply = `${reply} ${suffix}`;
  }
  return reply;
}

export class MockProvider implements LlmProvider {
  readonly name = "mock";
  readonly isMock = true;

  async complete(_request: CompletionRequest): Promise<string> {
    void _request;
    return "";
  }
}

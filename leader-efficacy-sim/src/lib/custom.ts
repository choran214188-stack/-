import { z } from "zod";
import type { Persona } from "@/types/persona";
import type { Scenario } from "@/types/scenario";

const line = (max: number) => z.string().trim().max(max);

/** 사용자가 직접 입력한 팀장 */
export const customPersonaSchema = z.object({
  name: line(20).min(1),
  levelLabel: line(20).default("난이도 중"),
  level: z.coerce.number().int().min(1).max(4).default(2),
  subtitle: line(60).default(""),
  tagline: line(200).default(""),
  greeting: line(120).default(""),
  personality: z.array(line(120)).max(8).default([]),
  resistancePatterns: z.array(line(120)).max(8).default([]),
});

/** 사용자가 직접 입력한 상황 */
export const customScenarioSchema = z.object({
  title: line(60).min(1),
  summary: line(200).default(""),
  situation: line(1500).min(1),
  challenge: line(400).default(""),
  successCondition: line(400).default(""),
  opening: z.array(line(300)).max(3).default([]),
  managerGoal: z.array(line(200)).max(5).default([]),
  hints: z.array(line(200)).max(8).default([]),
  axis: z.enum(["A", "B"]).default("A"),
  recommendedUserTurns: z.coerce.number().int().min(2).max(20).default(6),
  maxUserTurns: z.coerce.number().int().min(4).max(20).default(12),
});

export type CustomPersonaInput = z.infer<typeof customPersonaSchema>;
export type CustomScenarioInput = z.infer<typeof customScenarioSchema>;

export const CUSTOM_PERSONA_ID = "custom-persona";
export const CUSTOM_SCENARIO_ID = "custom-scenario";

export function toPersona(input: CustomPersonaInput): Persona {
  return {
    id: CUSTOM_PERSONA_ID,
    name: input.name,
    position: "팀장",
    subtitle: input.subtitle || `${input.levelLabel.replace("난이도 ", "")} 유형`,
    tenure: "",
    generationLabel: "",
    level: (input.level as 1 | 2 | 3 | 4) ?? 2,
    levelLabel: input.levelLabel,
    tagline: input.tagline,
    greeting: input.greeting || `부르셨습니까, 부서장님?`,
    personality: input.personality.length > 0 ? input.personality : ["직접 입력한 팀장"],
    resistancePatterns: input.resistancePatterns,
    custom: true,
  };
}

export function toScenario(input: CustomScenarioInput): Scenario {
  return {
    id: CUSTOM_SCENARIO_ID,
    title: input.title,
    label: "직접 입력",
    summary: input.summary,
    situation: input.situation,
    opening: input.opening,
    currentState: [],
    managerGoal: input.managerGoal,
    recommendedUserTurns: input.recommendedUserTurns,
    maxUserTurns: Math.max(input.maxUserTurns, input.recommendedUserTurns),
    hints: input.hints,
    coach: {},
    axis: input.axis,
    custom: true,
  };
}

/** API 요청 본문에 함께 오는 직접 입력값 */
export const customPayloadSchema = z
  .object({
    customPersona: customPersonaSchema.optional(),
    customScenario: customScenarioSchema.optional(),
  })
  .partial();

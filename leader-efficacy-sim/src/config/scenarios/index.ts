import type { Scenario } from "@/types/scenario";
import { defaultScenario } from "./default-scenario";
import {
  burnoutScenario,
  seniorMembersScenario,
  teamConflictScenario,
} from "./extra-scenarios";

/** 선택 가능한 상황 목록 */
export const scenarioList: Scenario[] = [
  defaultScenario,
  seniorMembersScenario,
  teamConflictScenario,
  burnoutScenario,
];

export const scenarios: Record<string, Scenario> = Object.fromEntries(
  scenarioList.map((s) => [s.id, s]),
);

export const DEFAULT_SCENARIO_ID = defaultScenario.id;

export function getScenario(id?: string): Scenario {
  if (id && scenarios[id]) return scenarios[id];
  return defaultScenario;
}

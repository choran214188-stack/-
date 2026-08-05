import type { Persona } from "@/types/persona";
import { defaultPersona } from "./default-persona";
import { haneulPersona, seoyeonPersona, woojaePersona } from "./extra-personas";

/** 난이도 순으로 정렬된 선택 가능한 페르소나 목록 */
export const personaList: Persona[] = [
  haneulPersona,
  seoyeonPersona,
  defaultPersona,
  woojaePersona,
];

export const personas: Record<string, Persona> = Object.fromEntries(
  personaList.map((p) => [p.id, p]),
);

export const DEFAULT_PERSONA_ID = defaultPersona.id;

export function getPersona(id?: string): Persona {
  if (id && personas[id]) return personas[id];
  return defaultPersona;
}

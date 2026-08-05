"use client";

import type { SimulationSession } from "@/types/session";

const KEY = "leader-efficacy-sim:session";

export function loadSession(): SimulationSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SimulationSession;
    if (!parsed?.id || !Array.isArray(parsed.messages)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: SimulationSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // 저장 실패는 대화 진행을 막지 않는다.
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

const SELECTION_KEY = "leader-efficacy-sim:selection";

export type Selection = { personaId: string; scenarioId: string };

export function loadSelection(): Selection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SELECTION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Selection;
    if (!parsed?.personaId || !parsed?.scenarioId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveSelection(selection: Selection): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SELECTION_KEY, JSON.stringify(selection));
  } catch {
    // 선택 저장 실패는 진행을 막지 않는다.
  }
}

const CUSTOM_KEY = "leader-efficacy-sim:custom";

export type CustomStore = {
  persona?: import("@/lib/custom").CustomPersonaInput;
  scenario?: import("@/lib/custom").CustomScenarioInput;
};

export function loadCustom(): CustomStore | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOM_KEY);
    return raw ? (JSON.parse(raw) as CustomStore) : null;
  } catch {
    return null;
  }
}

export function saveCustom(store: CustomStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CUSTOM_KEY, JSON.stringify(store));
  } catch {
    // 저장 실패는 진행을 막지 않는다.
  }
}

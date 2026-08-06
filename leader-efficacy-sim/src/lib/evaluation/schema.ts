import { z } from "zod";

/** 모델이 ○/△/× 대신 O, X, ✓ 등 변형을 뱉어도 정규화한다. */
function normalizeMark(value: unknown): "○" | "△" | "×" {
  const s = String(value ?? "").trim().toLowerCase();
  if (["○", "◯", "●", "o", "0", "✓", "✔", "√", "v", "yes", "y", "충족", "상"].includes(s)) return "○";
  if (["△", "▲", "~", "partial", "p", "부분", "중"].includes(s)) return "△";
  return "×"; // ×, x, ✗, "", 그 외 전부
}

export const markSchema = z.preprocess(normalizeMark, z.enum(["○", "△", "×"]));

export const evidenceSchema = z.object({
  turn: z.coerce.number().int().default(0),
  quote: z.string().default(""),
});

export const criterionSchema = z.object({
  id: z.string().default(""),
  mark: markSchema,
  note: z.string().default(""),
  evidence: z.array(evidenceSchema).default([]),
  missing: z.string().default(""),
});

export const axisSchema = z.object({
  key: z.string().default(""),
  criteria: z.array(criterionSchema).default([]),
  betterResponseExample: z.string().default(""),
});

export const warningSchema = z.object({
  type: z.string(),
  turn: z.coerce.number().int().default(0),
  quote: z.string().default(""),
  reason: z.string().default(""),
});

export const reviewSchema = z.object({
  summary: z
    .object({
      oneLine: z.string().default(""),
      overall: z.string().default(""),
      expectedImpact: z.string().default(""),
      strengths: z.array(z.string()).default([]),
      improvements: z.array(z.string()).default([]),
    })
    .default({}),
  axes: z.array(axisSchema).default([]),
  warnings: z.array(warningSchema).default([]),
  recommendedDialogue: z
    .object({
      opening: z.string().default(""),
      closing: z.string().default(""),
    })
    .default({}),
});

export type RawReview = z.infer<typeof reviewSchema>;

/** LLM 출력에서 JSON 본문만 추출한다. */
export function extractJson(raw: string): unknown {
  const trimmed = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("JSON 형식을 찾지 못했습니다.");
  return JSON.parse(trimmed.slice(start, end + 1));
}

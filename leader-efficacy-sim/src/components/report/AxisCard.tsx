"use client";

import { useState } from "react";
import type { AxisReview, Mark } from "@/types/evaluation";
import { EvidenceCard } from "./EvidenceCard";

const MARK_STYLE: Record<Mark, string> = {
  "○": "bg-navy text-white",
  "△": "bg-gold text-white",
  "×": "bg-[#E2DDD2] text-[#6B6459]",
};
const SEG_STYLE: Record<Mark, string> = {
  "○": "bg-navy",
  "△": "bg-gold",
  "×": "bg-[#E2DDD2]",
};
const MARK_LABEL: Record<Mark, string> = { "○": "충족", "△": "부분", "×": "미확인" };

export function AxisCard({ axis, index }: { axis: AxisReview; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-navy">{axis.title}</h3>
          <p className="mt-1 text-[12.5px] text-navy-muted">{axis.desc}</p>
        </div>
        <p className="shrink-0 text-[13px] font-semibold text-navy">
          충족 {axis.counts.ok} · 부분 {axis.counts.part} · 미확인 {axis.counts.none}
          <span className="font-normal text-navy-muted"> / {axis.criteria.length}</span>
        </p>
      </div>

      <div className="mt-3 flex gap-1">
        {axis.criteria.map((c) => (
          <span key={c.id} className={`h-2 flex-1 rounded-full ${SEG_STYLE[c.mark]}`} />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-3 text-[12.5px] font-semibold text-gold hover:underline"
      >
        {open ? "기준 접기" : `기준 ${axis.criteria.length}개 자세히 보기`}
      </button>

      {open ? (
        <>
          <ul className="mt-2">
            {axis.criteria.map((c) => (
              <li key={c.id} className="border-t border-hair py-3.5 first:border-t-0">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[13px] font-semibold text-navy">
                    <span
                      className={`mr-2 inline-flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11px] ${MARK_STYLE[c.mark]}`}
                    >
                      {c.mark}
                    </span>
                    {c.name}
                  </p>
                  <p className="shrink-0 text-[12px] font-semibold text-navy-muted">
                    {MARK_LABEL[c.mark]}
                  </p>
                </div>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-soft">{c.note}</p>
                {c.evidence.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {c.evidence.map((e, i) => (
                      <EvidenceCard key={`${e.turn}-${i}`} evidence={e} />
                    ))}
                  </div>
                ) : null}
                {c.missing ? (
                  <p className="mt-2 text-[12px] leading-relaxed text-[#7A5B14]">
                    보완할 행동 · {c.missing}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
          {axis.betterResponseExample ? (
            <div className="mt-3 rounded-xl bg-frost p-4">
              <p className="text-[11.5px] font-semibold text-navy-muted">이렇게 말할 수 있었습니다</p>
              <p className="mt-1.5 break-anywhere text-[13px] leading-relaxed text-navy">
                “{axis.betterResponseExample}”
              </p>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

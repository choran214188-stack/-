import type { CriterionScore, DomainReview } from "@/types/evaluation";
import { EvidenceCard } from "./EvidenceCard";

function scoreColor(score: number) {
  if (score >= 4) return "bg-navy text-white";
  if (score === 3) return "bg-gold text-white";
  return "bg-[#E2DDD2] text-[#6B6459]";
}

function CriterionRow({ c }: { c: CriterionScore }) {
  return (
    <li className="border-t border-hair py-4 first:border-t-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[13.5px] font-semibold text-navy">{c.name}</p>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-bold ${scoreColor(c.score)}`}
        >
          {c.score} / 5
        </span>
      </div>
      <p className="mt-1 text-[12px] leading-relaxed text-navy-muted">{c.desc}</p>
      <p className="mt-2 text-[12.5px] leading-relaxed text-navy-soft">{c.reason}</p>
      {c.evidence.length > 0 ? (
        <div className="mt-2 space-y-1.5">
          {c.evidence.map((e, i) => (
            <EvidenceCard key={`${e.turn}-${i}`} evidence={e} />
          ))}
        </div>
      ) : null}
      {c.advice ? (
        <p className="mt-2 rounded-lg bg-frost px-3 py-2 text-[12px] leading-relaxed text-[#7A5B14]">
          더 나아지려면 · {c.advice}
        </p>
      ) : null}
    </li>
  );
}

export function DomainCard({ domain }: { domain: DomainReview }) {
  const pct = Math.round((domain.score / domain.max) * 100);
  return (
    <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[16px] font-bold text-navy">{domain.title}</h3>
          <p className="mt-1 text-[12.5px] leading-relaxed text-navy-muted">{domain.desc}</p>
        </div>
        <p className="shrink-0 font-serif-display text-[22px] font-medium leading-none text-navy">
          {domain.score}
          <span className="text-[13px] font-normal text-navy-muted"> / {domain.max}</span>
        </p>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#EDEFF4]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-navy-soft to-navy"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-3">
        {domain.criteria.map((c) => (
          <CriterionRow key={c.id} c={c} />
        ))}
      </ul>
    </section>
  );
}

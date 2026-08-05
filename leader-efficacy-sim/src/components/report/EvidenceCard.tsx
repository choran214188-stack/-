import type { Evidence } from "@/types/evaluation";

type Props = { evidence: Evidence; tag?: string };

export function EvidenceCard({ evidence, tag }: Props) {
  return (
    <div className="rounded-lg border-l-2 border-gold bg-ivory px-3 py-2">
      <p className="text-[11px] font-semibold text-navy-muted">
        부서장 {evidence.turn}번째 발언
        {tag ? <span className="ml-2 rounded bg-gold-pale px-1.5 py-0.5 text-[10px] text-[#7A5B14]">{tag}</span> : null}
      </p>
      <p className="mt-1 break-anywhere text-[12.5px] leading-relaxed text-navy-soft">
        “{evidence.quote}”
      </p>
    </div>
  );
}

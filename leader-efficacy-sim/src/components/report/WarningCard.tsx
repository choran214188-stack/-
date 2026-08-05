import type { WarningItem } from "@/types/evaluation";

export function WarningCard({ warnings }: { warnings: WarningItem[] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
      <h3 className="text-[15px] font-bold text-navy">주의가 필요한 발언</h3>
      {warnings.length === 0 ? (
        <p className="mt-3 text-[13px] text-navy-muted">
          임파워먼트를 약화시키는 발언은 확인되지 않았습니다.
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {warnings.map((w, i) => (
            <li key={`${w.turn}-${i}`} className="rounded-xl border border-line p-4">
              <p className="text-[13px] font-semibold text-navy">{w.type}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-navy-soft">{w.reason}</p>
              <div className="mt-2 rounded-lg border-l-2 border-[#B08585] bg-[#FBF6F4] px-3 py-2">
                <p className="text-[11px] font-semibold text-navy-muted">부서장 {w.turn}번째 발언</p>
                <p className="mt-1 break-anywhere text-[12.5px] text-navy-soft">“{w.quote}”</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

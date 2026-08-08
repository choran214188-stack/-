"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DomainCard } from "@/components/report/DomainCard";
import { WarningCard } from "@/components/report/WarningCard";
import { TranscriptView } from "@/components/report/TranscriptView";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { clearSession, loadCustom, loadSession } from "@/lib/storage/session-storage";
import { getPersona } from "@/config/personas";
import { getScenario } from "@/config/scenarios";
import { CUSTOM_PERSONA_ID, CUSTOM_SCENARIO_ID, toPersona, toScenario } from "@/lib/custom";
import type { SimulationSession } from "@/types/session";

export default function ReportPage() {
  const router = useRouter();
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);
  const [names, setNames] = useState({ persona: "", subtitle: "", level: "", scenario: "" });

  useEffect(() => {
    const saved = loadSession();
    setSession(saved);
    if (saved) {
      const custom = loadCustom();
      const persona =
        saved.personaId === CUSTOM_PERSONA_ID && custom?.persona
          ? toPersona(custom.persona)
          : getPersona(saved.personaId);
      const scenario =
        saved.scenarioId === CUSTOM_SCENARIO_ID && custom?.scenario
          ? toScenario(custom.scenario)
          : getScenario(saved.scenarioId);
      setNames({
        persona: persona.name,
        subtitle: persona.subtitle,
        level: persona.levelLabel,
        scenario: scenario.title,
      });
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-mist px-6">
        <p className="text-[13px] text-navy-muted">보고서를 불러오는 중입니다.</p>
      </main>
    );
  }

  const review = session?.evaluation;

  if (!session || !review) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-mist px-6 text-center">
        <h1 className="text-[18px] font-bold text-navy">표시할 점검 결과가 없습니다.</h1>
        <p className="max-w-[420px] text-[13px] leading-relaxed text-navy-muted">
          대화를 마치고 점검을 완료하면 이 화면에 결과가 표시됩니다.
        </p>
        <Link
          href="/"
          className="rounded-2xl bg-navy px-7 py-3.5 text-[13px] font-semibold text-white shadow-[0_16px_34px_-16px_rgba(22,35,60,0.75)] transition hover:bg-navy-soft"
        >
          시작 화면으로 이동
        </Link>
      </main>
    );
  }

  const { summary, domains, warnings, meta, score100, grade } = review;
  const pct = score100;

  return (
    <main className="relative min-h-[100dvh] bg-[radial-gradient(120%_70%_at_50%_-6%,#FFFFFF_0%,#F5F7FB_46%,#E9EDF4_100%)] px-5 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[880px]">
        <header className="text-center">
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60" />
            <p className="font-serif-display text-[13px] italic tracking-[0.22em] text-gold">
              Conversation Review
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <h1 className="mt-4 break-keep text-[25px] font-bold tracking-[-0.01em] text-navy sm:text-[32px]">
            임파워먼트 대화 점검
          </h1>
          <p className="mt-3 break-keep text-[12.5px] leading-relaxed text-navy-muted">
            {names.persona} · {names.subtitle} · {names.level}
            <br />
            {names.scenario}
          </p>
        </header>

        {/* 종합 점수 */}
        <section className="mt-8 overflow-hidden rounded-[24px] border border-hair bg-white shadow-[0_28px_70px_-44px_rgba(22,35,60,0.5)]">
          <div className="h-[3px] w-full bg-gradient-to-r from-gold-soft via-gold to-gold-soft" />
          <div className="p-6 sm:p-8">
            <div className="flex flex-col items-center">
              <span className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-semibold tracking-wide text-gold-soft">
                {grade}
              </span>
              <p className="mt-3 font-serif-display text-[52px] font-medium leading-none text-navy">
                {score100}
                <span className="text-[20px] font-normal text-navy-muted"> / 100</span>
              </p>
              <div className="mt-4 h-2 w-full max-w-[320px] overflow-hidden rounded-full bg-[#EDEFF4]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-soft to-gold"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <p className="mt-5 text-center text-[15px] font-semibold leading-relaxed text-navy">
              {summary.oneLine}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-hair pt-5 text-center">
              {domains.map((d) => (
                <div key={d.key}>
                  <dt className="text-[12px] tracking-wide text-navy-muted">{d.title}</dt>
                  <dd className="mt-1 font-serif-display text-[24px] font-medium leading-none text-navy">
                    {d.score}
                    <span className="text-[12px] font-normal text-navy-muted"> / {d.max}</span>
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-center text-[11.5px] leading-relaxed text-navy-muted">
              짧은 연습 대화라 모든 항목을 높게 받기는 어렵습니다. 다룬 부분 위주로 봐주세요.
            </p>
            <p className="mt-4 border-t border-hair pt-4 text-[11.5px] text-navy-muted">
              부서장 응답 {meta.userTurnCount}회 · 사용한 힌트 {meta.hintCount}회
            </p>
          </div>
        </section>

        {/* 총평 */}
        {summary.overall ? (
          <section className="mt-6 rounded-2xl border border-hair bg-navy p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-soft">
              총평
            </p>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/95">{summary.overall}</p>
          </section>
        ) : null}

        {/* 잘한 점 / 개선할 점 */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-navy">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F1EA] text-[12px] text-[#2E7D57]">
                ✓
              </span>
              가장 잘한 행동
            </h3>
            {summary.strengths.length ? (
              <ul className="mt-3 space-y-2.5">
                {summary.strengths.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-navy-soft">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2E7D57]" />
                    <span className="break-anywhere">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[12.5px] text-navy-muted">이번 대화에서 확인된 강점이 적습니다.</p>
            )}
          </section>

          <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-navy">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-pale text-[12px] text-gold">
                ↑
              </span>
              개선이 필요한 행동
            </h3>
            {summary.improvements.length ? (
              <ul className="mt-3 space-y-2.5">
                {summary.improvements.map((t, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-navy-soft">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    <span className="break-anywhere">{t}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-[12.5px] text-navy-muted">큰 개선점 없이 잘 이끌어갔습니다.</p>
            )}
          </section>
        </div>

        {/* 영역별 상세 */}
        <details className="group mt-10" open>
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-hair bg-white px-5 py-4 text-[15px] font-bold text-navy [&::-webkit-details-marker]:hidden">
            영역별 상세 점검
            <span className="text-[12px] font-medium text-navy-muted">
              <span className="group-open:hidden">자세히 보기 ▾</span>
              <span className="hidden group-open:inline">접기 ▴</span>
            </span>
          </summary>
          <div className="mt-4 space-y-4">
            {domains.map((domain) => (
              <DomainCard key={domain.key} domain={domain} />
            ))}
          </div>
        </details>

        <div className="mt-6 space-y-4">
          <WarningCard warnings={warnings} />

          <TranscriptView
            messages={session.messages}
            personaName={names.persona}
            evaluation={review}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setRetryOpen(true)}
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-navy px-7 py-4 text-[14px] font-semibold text-white shadow-[0_16px_34px_-16px_rgba(22,35,60,0.75)] transition hover:bg-navy-soft"
          >
            다시 도전하기
            <span className="text-gold-soft transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-navy/15 bg-white/60 px-7 py-4 text-center text-[14px] font-semibold text-navy transition hover:border-gold/50 hover:bg-white"
          >
            시작 화면으로
          </Link>
        </div>

        <p className="mt-8 border-t border-hair pt-5 text-[11.5px] leading-relaxed text-navy-muted">
          이 점검표는 인사평가나 심리 진단이 아니라 대화 연습을 돕기 위한 교육용 도구입니다. 점수는
          대화에서 확인된 부서장 발언을 기준으로 규칙에 따라 산정됩니다.
        </p>
      </div>

      <ConfirmModal
        open={retryOpen}
        title="다시 도전할까요?"
        description="이번 대화 기록과 점검 결과가 삭제되고 새 대화가 시작됩니다."
        cancelLabel="취소"
        confirmLabel="새로 시작"
        tone="danger"
        onCancel={() => setRetryOpen(false)}
        onConfirm={() => {
          clearSession();
          router.push("/simulation");
        }}
      />
    </main>
  );
}

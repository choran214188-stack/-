"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AxisCard } from "@/components/report/AxisCard";
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

  const { summary, axes, warnings, recommendedDialogue, meta } = review;

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
            {meta.axisSet === "B" ? " · 권한 밖 사안 점검 축" : ""}
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-[24px] border border-hair bg-white shadow-[0_28px_70px_-44px_rgba(22,35,60,0.5)]">
          <div className="h-[3px] w-full bg-gradient-to-r from-gold-soft via-gold to-gold-soft" />
          <div className="p-6 sm:p-8">
          <p className="text-[16px] font-semibold leading-relaxed text-navy">{summary.oneLine}</p>
          <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-hair pt-5 text-center">
            <div>
              <dt className="text-[11px] tracking-wide text-navy-muted">충족</dt>
              <dd className="mt-1 font-serif-display text-[26px] font-medium leading-none text-navy">
                {summary.counts.done}
                <span className="text-[13px] font-normal text-navy-muted"> / 20</span>
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-navy-muted">부분</dt>
              <dd className="mt-1 font-serif-display text-[26px] font-medium leading-none text-gold">
                {summary.counts.partial}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] tracking-wide text-navy-muted">미확인</dt>
              <dd className="mt-1 font-serif-display text-[26px] font-medium leading-none text-[#7A6A6A]">
                {summary.counts.missing}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-center text-[11.5px] leading-relaxed text-navy-muted">
            짧은 연습 대화라 모든 항목을 다루기는 어렵습니다. 다룬 부분 위주로 봐주세요.
          </p>
          <div className="mt-5 grid gap-2 border-t border-hair pt-4 text-[12.5px] text-navy-muted sm:grid-cols-2">
            <p>
              가장 잘 다룬 축 · <strong className="text-navy">{summary.strongest}</strong>
            </p>
            <p>
              가장 비어 있는 축 · <strong className="text-navy">{summary.weakest}</strong>
            </p>
          </div>
          <p className="mt-5 border-t border-hair pt-4 text-[11.5px] text-navy-muted">
            부서장 응답 {meta.userTurnCount}회 · 사용한 힌트 {meta.hintCount}회 · 검증으로 제거된 인용{" "}
            {meta.removedEvidenceCount}건
          </p>
          </div>
        </section>

        {summary.overall ? (
          <section className="mt-6 rounded-2xl border border-hair bg-navy p-6 sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-gold-soft">
              총평
            </p>
            <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/95">{summary.overall}</p>
          </section>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
            <h3 className="flex items-center gap-2 text-[14px] font-bold text-navy">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E7F1EA] text-[12px] text-[#2E7D57]">
                ✓
              </span>
              잘한 점
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
              개선할 점
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

        <h2 className="mt-10 text-[16px] font-bold text-navy">축별 점검 결과</h2>
        <div className="mt-4 space-y-4">
          {axes.map((axis, index) => (
            <AxisCard key={axis.key} axis={axis} index={index} />
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <WarningCard warnings={warnings} />

          <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
            <h3 className="text-[15px] font-bold text-navy">개선 대화문</h3>
            <p className="mt-1 text-[12px] text-navy-muted">
              같은 상황에서 다시 말한다면 이렇게 할 수 있습니다.
            </p>
            <ol className="mt-4 space-y-3">
              {[
                { label: "대화 시작", text: recommendedDialogue.opening },
                ...axes.map((a) => ({ label: a.title, text: a.betterResponseExample })),
                { label: "실행 합의 마무리", text: recommendedDialogue.closing },
              ]
                .filter((item) => item.text)
                .map((item) => (
                  <li key={item.label} className="rounded-xl border border-hair/70 bg-frost p-4">
                    <p className="text-[11.5px] font-semibold tracking-wide text-gold">
                      {item.label}
                    </p>
                    <p className="mt-1.5 break-anywhere text-[13px] leading-relaxed text-navy">
                      “{item.text}”
                    </p>
                  </li>
                ))}
            </ol>
          </section>

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
          이 점검표는 인사평가나 심리 진단이 아니라 대화에서 다루지 못한 영역을 찾기 위한 교육용
          도구입니다. 모든 판정은 실제 대화에서 확인된 부서장 발언을 근거로 서버에서 다시
          검증했습니다.
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

"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  clearSession,
  loadSession,
  saveCustom,
  saveSelection,
} from "@/lib/storage/session-storage";
import { CUSTOM_PERSONA_ID, CUSTOM_SCENARIO_ID } from "@/lib/custom";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { CASES } from "@/config/cases";

export default function StartPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 새로 들어오면 선택은 초기화한다.
    const saved = loadSession();
    setHasSaved(Boolean(saved && saved.messages.length > 0));
  }, []);

  const start = () => {
    if (selected === null) return setError("대화할 팀장을 선택해주세요.");
    setError(null);
    const c = CASES[selected];
    saveCustom({ persona: c.persona, scenario: c.scenario });
    saveSelection({ personaId: CUSTOM_PERSONA_ID, scenarioId: CUSTOM_SCENARIO_ID });
    clearSession();
    router.push("/simulation");
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(125%_90%_at_50%_-8%,#FFFFFF_0%,#F5F7FB_44%,#E8ECF3_100%)] px-5 py-14 sm:px-8 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-navy/[0.06] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-52 w-[30rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[720px]">
        <header className="animate-rise text-center" style={{ animationDelay: "40ms" }}>
          <div className="mx-auto flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/60" />
            <p className="font-serif-display text-[13px] italic tracking-[0.25em] text-gold">
              Leadership Practice
            </p>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/60" />
          </div>

          <h1 className="mt-5 break-keep text-[28px] font-bold leading-[1.25] tracking-[-0.01em] text-navy sm:text-[36px]">
            팀장 임파워먼트 대화 시뮬레이션
          </h1>

          <p className="mx-auto mt-5 max-w-[460px] break-keep text-[13.5px] leading-relaxed text-navy-soft">
            무력감을 느끼는 두 팀장 중 한 명을 골라, 부서장이 되어 대화로 풀어보세요. 대화가 끝나면
            임파워먼트 네 가지 축을 얼마나 다뤘는지 점검해 드립니다.
          </p>
        </header>

        <div
          className="animate-rise mt-10 grid gap-4 sm:grid-cols-2"
          style={{ animationDelay: "140ms" }}
        >
          {CASES.map((c, i) => {
            const on = selected === i;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={on}
                className={`group relative overflow-hidden rounded-[22px] border bg-white p-5 text-left transition sm:p-6 ${
                  on
                    ? "border-navy shadow-[0_24px_60px_-34px_rgba(22,35,60,0.6)] ring-2 ring-navy/15"
                    : "border-hair hover:border-gold/60 hover:shadow-[0_20px_50px_-36px_rgba(22,35,60,0.5)]"
                }`}
              >
                {on ? (
                  <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[13px] text-white">
                    ✓
                  </span>
                ) : null}

                <div className="flex items-center gap-4">
                  <Image
                    src={c.persona.profileImage}
                    alt={c.persona.name}
                    width={72}
                    height={88}
                    className="h-[88px] w-[72px] shrink-0 rounded-xl border border-hair object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold text-navy">{c.persona.name}</p>
                    <p className="mt-0.5 text-[12px] text-navy-muted">{c.persona.subtitle}</p>
                    <span className="mt-2 inline-block rounded-full bg-gold-pale px-2.5 py-1 text-[11px] font-semibold text-[#8A6D2A]">
                      {c.factor}
                    </span>
                  </div>
                </div>

                <p className="mt-4 break-keep border-t border-hair pt-3.5 text-[13px] leading-relaxed text-navy-soft">
                  {c.headline}
                </p>
              </button>
            );
          })}
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-[#E1CBCB] bg-[#FBF1F1] px-4 py-3 text-center text-[12.5px] text-[#84343A]">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={hasSaved ? () => setConfirmNew(true) : start}
            className="group inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-navy px-7 py-4 text-[14px] font-semibold tracking-tight text-white shadow-[0_16px_34px_-16px_rgba(22,35,60,0.75)] transition hover:bg-navy-soft"
          >
            대화 시작하기
            <span className="text-gold-soft transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </button>
          {hasSaved ? (
            <button
              type="button"
              onClick={() => router.push("/simulation")}
              className="rounded-2xl border border-navy/15 bg-white/60 px-7 py-4 text-[14px] font-semibold text-navy transition hover:border-gold/50 hover:bg-white"
            >
              이어서 진행
            </button>
          ) : null}
        </div>

        <p
          className="animate-rise mx-auto mt-8 max-w-[460px] text-center text-[11.5px] leading-relaxed text-navy-muted"
          style={{ animationDelay: "240ms" }}
        >
          대화 내용은 이 브라우저에만 저장되며 서버에 보관되지 않습니다. 인사평가나 심리 진단이 아닌
          리더십 교육용 대화 점검 도구입니다.
        </p>
      </div>

      <ConfirmModal
        open={confirmNew}
        title="새로 시작할까요?"
        description="저장된 대화가 삭제되고 지금 선택한 팀장으로 처음부터 다시 시작합니다."
        cancelLabel="취소"
        confirmLabel="새로 시작"
        tone="danger"
        onCancel={() => setConfirmNew(false)}
        onConfirm={() => {
          clearSession();
          setConfirmNew(false);
          start();
        }}
      />
    </main>
  );
}

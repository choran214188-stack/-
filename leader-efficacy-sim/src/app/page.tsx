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
import {
  CUSTOM_PERSONA_ID,
  CUSTOM_SCENARIO_ID,
  type CustomPersonaInput,
  type CustomScenarioInput,
} from "@/lib/custom";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { CASES } from "@/config/cases";

type Selected = number | "custom" | null;

const EMPTY_FORM = { name: "", subtitle: "", personality: "", situation: "" };

export default function StartPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [selected, setSelected] = useState<Selected>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 새로 들어오면 선택·입력값은 초기화한다.
    const saved = loadSession();
    setHasSaved(Boolean(saved && saved.messages.length > 0));
  }, []);

  const buildCustom = (): { persona: CustomPersonaInput; scenario: CustomScenarioInput } | null => {
    const name = form.name.trim();
    const situation = form.situation.trim();
    const subtitle = form.subtitle.trim();
    if (!name || !situation) {
      setError("팀원 이름과 상황은 꼭 입력해주세요.");
      return null;
    }
    const persona: CustomPersonaInput = {
      name,
      levelLabel: "난이도 중",
      level: 2,
      subtitle,
      tagline: "",
      greeting: "",
      profileImage: "",
      personality: form.personality
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 8),
      resistancePatterns: [],
    };
    const scenario: CustomScenarioInput = {
      title: subtitle ? `${name} · ${subtitle}` : `${name}님과의 대화`,
      summary: "",
      situation,
      challenge: "",
      successCondition: "",
      opening: [],
      managerGoal: [],
      hints: [
        "지금 막힌 게 '능력'인지 '상황·구조'인지 먼저 확인해보세요.",
        "부서장이 지원할 수 있는 게 무엇인지 구체적으로 물어보세요.",
        "전부가 아니라 '오늘 할 수 있는 한 가지'로 좁혀보세요.",
      ],
      axis: "A",
      recommendedUserTurns: 6,
      maxUserTurns: 12,
    };
    return { persona, scenario };
  };

  const start = () => {
    if (selected === null) return setError("대화할 팀원을 선택해주세요.");
    setError(null);

    if (selected === "custom") {
      const built = buildCustom();
      if (!built) return;
      saveCustom(built);
    } else {
      const c = CASES[selected];
      saveCustom({ persona: c.persona, scenario: c.scenario });
    }

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
            무력감을 느끼는 팀장과 부서장이 되어 대화로 풀어보세요. 예시 팀장을 고르거나, 우리 팀원을
            직접 만들어 연습할 수 있습니다. 대화가 끝나면 임파워먼트 네 가지 축을 얼마나 다뤘는지
            점검해 드립니다.
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
                  <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-xl bg-navy">
                    <Image
                      src={c.persona.profileImage}
                      alt={c.persona.name}
                      fill
                      sizes="88px"
                      className="object-cover object-top"
                    />
                  </div>
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

        {/* 직접 만들기 */}
        <button
          type="button"
          onClick={() => setSelected("custom")}
          aria-pressed={selected === "custom"}
          className={`animate-rise mt-4 flex w-full items-center gap-4 rounded-[22px] border-2 border-dashed bg-white/70 p-5 text-left transition sm:p-6 ${
            selected === "custom"
              ? "border-navy bg-white shadow-[0_24px_60px_-34px_rgba(22,35,60,0.6)]"
              : "border-hair hover:border-gold/60 hover:bg-white"
          }`}
          style={{ animationDelay: "200ms" }}
        >
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-[22px] font-light transition ${
              selected === "custom" ? "bg-navy text-white" : "bg-navy/[0.06] text-navy"
            }`}
          >
            +
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-bold text-navy">우리 팀원으로 직접 연습하기</p>
            <p className="mt-0.5 break-keep text-[12.5px] leading-relaxed text-navy-muted">
              실제 부하직원의 이름·성격·상황을 넣으면, 그 사람과 그 상황으로 대화하고 똑같은 기준으로
              점검받습니다.
            </p>
          </div>
        </button>

        {/* 직접 입력 폼 */}
        {selected === "custom" ? (
          <div className="animate-rise mt-4 rounded-[22px] border border-hair bg-white p-5 sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[12.5px] font-semibold text-navy">
                  팀원 이름 <span className="text-gold">*</span>
                </span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예) 김도현 팀장"
                  maxLength={20}
                  className="mt-1.5 w-full rounded-xl border border-hair bg-frost px-3.5 py-3 text-[14px] text-navy outline-none transition placeholder:text-navy-muted/60 focus:border-navy focus:bg-white"
                />
              </label>
              <label className="block">
                <span className="text-[12.5px] font-semibold text-navy">소속 · 직책</span>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="예) 영업기획팀 · 팀장 2년차"
                  maxLength={40}
                  className="mt-1.5 w-full rounded-xl border border-hair bg-frost px-3.5 py-3 text-[14px] text-navy outline-none transition placeholder:text-navy-muted/60 focus:border-navy focus:bg-white"
                />
              </label>
            </div>

            <label className="mt-4 block">
              <span className="text-[12.5px] font-semibold text-navy">성격 · 특징</span>
              <span className="ml-1 text-[11px] text-navy-muted">(한 줄에 하나씩, 선택)</span>
              <textarea
                value={form.personality}
                onChange={(e) => setForm((f) => ({ ...f, personality: e.target.value }))}
                placeholder={"예)\n분석력은 좋지만 결정을 자꾸 미룬다\n칭찬만으로는 안심하지 못한다\n힘든 티를 잘 내지 않는다"}
                rows={4}
                maxLength={600}
                className="mt-1.5 w-full resize-none rounded-xl border border-hair bg-frost px-3.5 py-3 text-[14px] leading-relaxed text-navy outline-none transition placeholder:text-navy-muted/60 focus:border-navy focus:bg-white"
              />
            </label>

            <label className="mt-4 block">
              <span className="text-[12.5px] font-semibold text-navy">
                지금 상황 · 무력감의 원인 <span className="text-gold">*</span>
              </span>
              <textarea
                value={form.situation}
                onChange={(e) => setForm((f) => ({ ...f, situation: e.target.value }))}
                placeholder="예) 새 프로모션 기획을 맡았는데, 상사의 잦은 세부 피드백을 받으면서 스스로 결정하기를 주저하고 확신 있게 움직이지 못하고 있다."
                rows={4}
                maxLength={1500}
                className="mt-1.5 w-full resize-none rounded-xl border border-hair bg-frost px-3.5 py-3 text-[14px] leading-relaxed text-navy outline-none transition placeholder:text-navy-muted/60 focus:border-navy focus:bg-white"
              />
            </label>

            <p className="mt-3 text-[11.5px] leading-relaxed text-navy-muted">
              입력한 내용은 이 브라우저에만 저장되며, 팀장 역할을 맡은 AI가 그 성격과 상황에 맞춰
              대화합니다.
            </p>
          </div>
        ) : null}

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
        description="저장된 대화가 삭제되고 지금 선택한 팀원으로 처음부터 다시 시작합니다."
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

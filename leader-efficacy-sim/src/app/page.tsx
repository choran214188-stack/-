"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearSession,
  loadCustom,
  loadSession,
  saveCustom,
  saveSelection,
} from "@/lib/storage/session-storage";
import { CUSTOM_PERSONA_ID, CUSTOM_SCENARIO_ID } from "@/lib/custom";
import { ConfirmModal } from "@/components/common/ConfirmModal";

const DEFAULT_LEVEL_LABEL = "난이도 중";

const toLines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.replace(/^[-·•\s]+/, "").trim())
    .filter(Boolean);

/** 상황 설명 앞부분을 잘라 자동으로 제목을 만든다. */
const deriveTitle = (situation: string) => {
  const first = situation.split(/[.\n]/)[0]?.trim() ?? "";
  const base = (first || situation.trim()).slice(0, 40).trim();
  return base || "직접 입력한 상황";
};

const field =
  "mt-2 w-full rounded-xl border border-hair bg-white/80 px-4 py-3 text-[14px] leading-relaxed text-navy outline-none transition placeholder:text-navy-muted/50 focus:border-gold focus:bg-white focus:ring-4 focus:ring-gold/10";

const labelClass =
  "flex items-baseline gap-2 text-[12.5px] font-semibold tracking-tight text-navy";

const numeral =
  "font-serif-display text-[15px] font-medium leading-none text-gold";

export default function StartPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [situation, setSituation] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSession();
    setHasSaved(Boolean(saved && saved.messages.length > 0));

    const stored = loadCustom();
    if (!stored) return;
    if (stored.persona) {
      setName(stored.persona.name ?? "");
      setPersonality((stored.persona.personality ?? []).join("\n"));
    }
    if (stored.scenario) {
      setSituation(stored.scenario.situation ?? "");
    }
  }, []);

  const start = () => {
    if (!name.trim()) return setError("팀장 이름을 입력해주세요.");
    if (!personality.trim()) return setError("팀장의 성격을 입력해주세요.");
    if (situation.trim().length < 20)
      return setError("상황을 조금 더 구체적으로 적어주세요. (20자 이상)");
    setError(null);

    const personalityLines = toLines(personality);

    saveCustom({
      persona: {
        name: name.trim(),
        levelLabel: DEFAULT_LEVEL_LABEL,
        level: 2,
        subtitle: "",
        tagline: personalityLines[0] ?? "",
        greeting: "",
        personality: personalityLines,
        resistancePatterns: [],
      },
      scenario: {
        title: deriveTitle(situation),
        summary: "",
        situation: situation.trim(),
        challenge: "",
        successCondition: "",
        opening: [],
        managerGoal: [],
        hints: [],
        axis: "A",
        recommendedUserTurns: 6,
        maxUserTurns: 12,
      },
    });
    saveSelection({ personaId: CUSTOM_PERSONA_ID, scenarioId: CUSTOM_SCENARIO_ID });
    clearSession();
    router.push("/simulation");
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[radial-gradient(125%_90%_at_50%_-8%,#FFFFFF_0%,#F5F7FB_44%,#E8ECF3_100%)] px-5 py-14 sm:px-8 sm:py-20">
      {/* 상단 네이비 광택 + 골드 후광 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-navy/[0.06] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-52 w-[30rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl"
      />

      <div className="relative mx-auto w-full max-w-[600px]">
        {/* 헤더 */}
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

          <p className="mx-auto mt-5 max-w-[420px] break-keep text-[13.5px] leading-relaxed text-navy-soft">
            팀장의 이름과 성격, 지금 처한 상황을 적으면 그 설정에 맞춰 AI 팀장과 실제처럼 대화합니다.
            대화가 끝나면 임파워먼트 네 가지 축을 얼마나 다뤘는지 점검해 드립니다.
          </p>
        </header>

        {/* 입력 카드 */}
        <section
          className="animate-rise mt-11 overflow-hidden rounded-[26px] border border-hair bg-white/80 shadow-[0_30px_80px_-42px_rgba(22,35,60,0.5)] backdrop-blur-sm"
          style={{ animationDelay: "140ms" }}
        >
          <div className="h-[3px] w-full bg-gradient-to-r from-gold-soft via-gold to-gold-soft" />

          <div className="space-y-7 p-6 sm:p-8">
            <div>
              <label className={labelClass} htmlFor="c-name">
                <span className={numeral}>01</span>
                이름
              </label>
              <input
                id="c-name"
                className={field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 김도현"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="c-personality">
                <span className={numeral}>02</span>
                성격
                <span className="text-[11.5px] font-normal text-navy-muted/70">
                  한 줄에 하나씩
                </span>
              </label>
              <textarea
                id="c-personality"
                rows={4}
                className={field}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder={"예) 책임감이 강하고 결과로 자신을 판단한다\n약점을 드러내는 것을 불편해한다\n막연한 격려에는 근거를 되묻는다"}
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="c-situation">
                <span className={numeral}>03</span>
                상황
                <span className="text-[11.5px] font-normal text-navy-muted/70">
                  구체적으로
                </span>
              </label>
              <textarea
                id="c-situation"
                rows={5}
                className={field}
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                placeholder="언제 무슨 일이 있었고, 지금 무엇을 결정해야 하며, 팀장이 어떤 상태인지 적어주세요."
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-[#E1CBCB] bg-[#FBF1F1] px-4 py-3 text-[12.5px] text-[#84343A]">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
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
          </div>
        </section>

        <p
          className="animate-rise mx-auto mt-8 max-w-[440px] text-center text-[11.5px] leading-relaxed text-navy-muted"
          style={{ animationDelay: "240ms" }}
        >
          입력한 내용은 이 브라우저에만 저장되며 서버에 보관되지 않습니다. 실제 구성원의 이름이나
          개인 정보는 넣지 마십시오. 인사평가나 심리 진단이 아닌 리더십 교육용 대화 점검 도구입니다.
        </p>
      </div>

      <ConfirmModal
        open={confirmNew}
        title="새로 시작할까요?"
        description="저장된 대화가 삭제되고 지금 입력한 설정으로 처음부터 다시 시작합니다."
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

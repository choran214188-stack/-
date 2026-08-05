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
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-navy outline-none placeholder:text-navy-muted/60 focus:border-gold";

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
    <main className="relative min-h-[100dvh] bg-ivory px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[560px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
          Leadership Practice
        </p>
        <h1 className="mt-3 text-[26px] font-bold leading-tight text-navy sm:text-[34px]">
          팀장 임파워먼트 대화 시뮬레이션
        </h1>
        <p className="mt-4 text-[13.5px] leading-relaxed text-navy-soft">
          팀장의 이름과 성격, 지금 처한 상황만 적으면 그 설정에 맞춰 AI 팀장과 메신저처럼 대화합니다.
          대화가 끝나면 임파워먼트 네 가지 축을 얼마나 다뤘는지 점검합니다.
        </p>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div>
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-name">
              이름 *
            </label>
            <input
              id="c-name"
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예) 김도현"
            />
          </div>

          <div className="mt-5">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-personality">
              성격 * (한 줄에 하나씩 적어도 됩니다)
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

          <div className="mt-5">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-situation">
              상황 * (지금 팀장이 처한 상황을 구체적으로)
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
        </section>

        {error ? (
          <p className="mt-4 rounded-xl border border-[#D9C3C3] bg-[#FBEFEF] px-4 py-3 text-[12.5px] text-[#7A2E2E]">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={hasSaved ? () => setConfirmNew(true) : start}
            className="rounded-xl bg-navy px-7 py-3.5 text-[14px] font-semibold text-white hover:bg-navy-soft"
          >
            대화 시작하기
          </button>
          {hasSaved ? (
            <button
              type="button"
              onClick={() => router.push("/simulation")}
              className="rounded-xl border border-navy/20 px-7 py-3.5 text-[14px] font-semibold text-navy hover:bg-white"
            >
              진행 중이던 대화 이어서 진행
            </button>
          ) : null}
        </div>

        <p className="mt-8 border-t border-line pt-5 text-[11.5px] leading-relaxed text-navy-muted">
          입력한 내용은 이 브라우저에만 저장되며 서버에 보관되지 않습니다. 실제 구성원의 이름이나
          개인 정보는 넣지 마십시오. 이 점검은 인사평가나 심리 진단이 아니라 리더십 교육을 위한
          대화 점검 도구입니다.
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

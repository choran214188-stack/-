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

const LEVELS = ["난이도 하", "난이도 중", "난이도 상", "난이도 최상"];

const toLines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.replace(/^[-·•\s]+/, "").trim())
    .filter(Boolean);

const field =
  "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] leading-relaxed text-navy outline-none placeholder:text-navy-muted/60 focus:border-gold";

export default function StartPage() {
  const router = useRouter();
  const [hasSaved, setHasSaved] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const [name, setName] = useState("");
  const [levelIdx, setLevelIdx] = useState(2);
  const [subtitle, setSubtitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [greeting, setGreeting] = useState("");
  const [personality, setPersonality] = useState("");
  const [resistance, setResistance] = useState("");

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [situation, setSituation] = useState("");
  const [challenge, setChallenge] = useState("");
  const [successCondition, setSuccessCondition] = useState("");
  const [opening, setOpening] = useState("");
  const [goals, setGoals] = useState("");
  const [hints, setHints] = useState("");
  const [axis, setAxis] = useState<"A" | "B">("A");
  const [recommended, setRecommended] = useState(6);
  const [maxTurns, setMaxTurns] = useState(12);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = loadSession();
    setHasSaved(Boolean(saved && saved.messages.length > 0));

    const stored = loadCustom();
    if (!stored) return;
    if (stored.persona) {
      const p = stored.persona;
      setName(p.name ?? "");
      setLevelIdx(Math.max(0, LEVELS.indexOf(p.levelLabel ?? "난이도 중")));
      setSubtitle(p.subtitle ?? "");
      setTagline(p.tagline ?? "");
      setGreeting(p.greeting ?? "");
      setPersonality((p.personality ?? []).join("\n"));
      setResistance((p.resistancePatterns ?? []).join("\n"));
    }
    if (stored.scenario) {
      const s = stored.scenario;
      setTitle(s.title ?? "");
      setSummary(s.summary ?? "");
      setSituation(s.situation ?? "");
      setChallenge(s.challenge ?? "");
      setSuccessCondition(s.successCondition ?? "");
      setOpening((s.opening ?? []).join("\n"));
      setGoals((s.managerGoal ?? []).join("\n"));
      setHints((s.hints ?? []).join("\n"));
      setAxis(s.axis ?? "A");
      setRecommended(s.recommendedUserTurns ?? 6);
      setMaxTurns(s.maxUserTurns ?? 12);
    }
  }, []);

  const start = () => {
    if (!name.trim()) return setError("팀장 이름을 입력해주세요.");
    if (!title.trim()) return setError("상황 제목을 입력해주세요.");
    if (situation.trim().length < 20)
      return setError("상황 설명을 조금 더 구체적으로 적어주세요. (20자 이상)");
    setError(null);

    saveCustom({
      persona: {
        name: name.trim(),
        levelLabel: LEVELS[levelIdx],
        level: levelIdx + 1,
        subtitle: subtitle.trim(),
        tagline: tagline.trim(),
        greeting: greeting.trim(),
        personality: toLines(personality),
        resistancePatterns: toLines(resistance),
      },
      scenario: {
        title: title.trim(),
        summary: summary.trim(),
        situation: situation.trim(),
        challenge: challenge.trim(),
        successCondition: successCondition.trim(),
        opening: toLines(opening),
        managerGoal: toLines(goals),
        hints: toLines(hints),
        axis,
        recommendedUserTurns: recommended,
        maxUserTurns: Math.max(maxTurns, recommended),
      },
    });
    saveSelection({ personaId: CUSTOM_PERSONA_ID, scenarioId: CUSTOM_SCENARIO_ID });
    clearSession();
    router.push("/simulation");
  };

  return (
    <main className="relative min-h-[100dvh] bg-ivory px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto w-full max-w-[720px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold">
          Leadership Practice
        </p>
        <h1 className="mt-3 text-[26px] font-bold leading-tight text-navy sm:text-[34px]">
          팀장 임파워먼트 대화 시뮬레이션
        </h1>
        <p className="mt-4 text-[13.5px] leading-relaxed text-navy-soft">
          팀장의 성격과 상황을 직접 적어 넣으면 그 설정으로 AI 팀장과 메신저처럼 대화합니다.
          대화가 끝나면 임파워먼트 네 가지 축을 얼마나 다뤘는지 점검합니다. 총점이나 등급은 매기지
          않습니다.
        </p>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <p className="text-[13px] font-bold text-navy">임파워먼트 대화의 네 가지 축</p>
          <ul className="mt-2.5 list-disc space-y-1 pl-4 text-[12.5px] leading-relaxed text-navy-soft">
            <li>
              과거에 <strong className="font-semibold">실제로 해낸 행동</strong>을 구체적으로 확인하고
              지금 과제와 연결하기
            </li>
            <li>
              비슷한 사례의 <strong className="font-semibold">결과가 아니라 해결 과정</strong>을 알려주기
            </li>
            <li>
              성격이 아니라 <strong className="font-semibold">관찰한 행동과 역량</strong>을 근거로 인정하기
            </li>
            <li>
              부담의 원인을 확인하고 <strong className="font-semibold">일정·권한·점검 계획</strong>을
              함께 정하기
            </li>
          </ul>
          <p className="mt-2.5 text-[11.5px] text-navy-muted">
            막연한 격려나 대신 해주겠다는 제안은 임파워먼트로 인정되지 않습니다.
          </p>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-navy">1. 팀장</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-level">
                난이도
              </label>
              <select
                id="c-level"
                className={field}
                value={levelIdx}
                onChange={(e) => setLevelIdx(Number(e.target.value))}
              >
                {LEVELS.map((l, i) => (
                  <option key={l} value={i}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-subtitle">
              성격 유형 · 연차
            </label>
            <input
              id="c-subtitle"
              className={field}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="예) 책임감 높은 자책형 · 팀장 2년 차"
            />
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-tagline">
              한 줄 소개
            </label>
            <input
              id="c-tagline"
              className={field}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="예) 결과로 판단하고 책임을 자신에게 돌립니다."
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-personality">
                성격·습관 (한 줄에 하나)
              </label>
              <textarea
                id="c-personality"
                rows={4}
                className={field}
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                placeholder={"결과 중심으로 판단한다\n약점을 드러내는 것을 불편해한다"}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-resistance">
                이렇게 저항한다 (한 줄에 하나)
              </label>
              <textarea
                id="c-resistance"
                rows={4}
                className={field}
                value={resistance}
                onChange={(e) => setResistance(e.target.value)}
                placeholder={"막연한 격려에는 근거를 되묻는다\n감정을 무시하면 방어적으로 답한다"}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-greeting">
              첫 인사말 (비우면 기본 인사말)
            </label>
            <input
              id="c-greeting"
              className={field}
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              placeholder="예) 부르셨습니까, 부서장님?"
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-[15px] font-bold text-navy">2. 상황</h2>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-title">
              상황 제목 *
            </label>
            <input
              id="c-title"
              className={field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 예산 삭감으로 프로젝트가 중단된 이후"
            />
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-summary">
              한 줄 요약
            </label>
            <input
              id="c-summary"
              className={field}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="예) 1년 준비한 과제가 중단되어 팀 전체가 무기력해진 상황"
            />
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-situation">
              상황 설명 * (팀장이 처한 사실을 구체적으로)
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

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-challenge">
                핵심 과제
              </label>
              <textarea
                id="c-challenge"
                rows={3}
                className={field}
                value={challenge}
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="이 대화에서 부서장이 풀어야 할 것"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-success">
                성공 조건
              </label>
              <textarea
                id="c-success"
                rows={3}
                className={field}
                value={successCondition}
                onChange={(e) => setSuccessCondition(e.target.value)}
                placeholder="어디까지 합의하면 잘한 대화인지"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-opening">
              팀장의 첫 메시지 (한 줄에 하나, 비우면 AI가 상황에 맞게 생성)
            </label>
            <textarea
              id="c-opening"
              rows={3}
              className={field}
              value={opening}
              onChange={(e) => setOpening(e.target.value)}
              placeholder={"이번 건으로 말씀 좀 드리고 싶습니다.\n솔직히 지금 상태로는 제가 계속 맡는 게 맞는지 모르겠습니다."}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-goals">
                부서장의 목표 (한 줄에 하나)
              </label>
              <textarea
                id="c-goals"
                rows={3}
                className={field}
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-hints">
                대화 힌트 (한 줄에 하나)
              </label>
              <textarea
                id="c-hints"
                rows={3}
                className={field}
                value={hints}
                onChange={(e) => setHints(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-ivory p-4">
            <p className="text-[12px] font-semibold text-navy">점검 축</p>
            <div className="mt-2 space-y-2">
              {[
                {
                  value: "A" as const,
                  label: "일반 임파워먼트",
                  desc: "의미 부여 · 역량 인정 · 권한 위임 · 지원과 부담 조절",
                },
                {
                  value: "B" as const,
                  label: "부서장 권한 밖 사안",
                  desc: "사실 확인 · 인정과 비왜곡 · 통제 범위 구분 · 가능한 실행 (보상·평가·조직 결정 등)",
                },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer gap-2.5 rounded-lg border p-3 ${
                    axis === opt.value ? "border-navy bg-white" : "border-line"
                  }`}
                >
                  <input
                    type="radio"
                    name="axis"
                    className="mt-0.5"
                    checked={axis === opt.value}
                    onChange={() => setAxis(opt.value)}
                  />
                  <span>
                    <span className="block text-[13px] font-semibold text-navy">{opt.label}</span>
                    <span className="mt-0.5 block text-[12px] leading-relaxed text-navy-muted">
                      {opt.desc}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-rec">
                권장 응답 횟수
              </label>
              <input
                id="c-rec"
                type="number"
                min={2}
                max={20}
                className={field}
                value={recommended}
                onChange={(e) => setRecommended(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-navy-muted" htmlFor="c-max">
                최대 응답 횟수
              </label>
              <input
                id="c-max"
                type="number"
                min={4}
                max={20}
                className={field}
                value={maxTurns}
                onChange={(e) => setMaxTurns(Number(e.target.value))}
              />
            </div>
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

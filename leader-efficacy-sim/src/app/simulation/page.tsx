"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneFrame } from "@/components/phone/PhoneFrame";
import { ChatHeader } from "@/components/chat/ChatHeader";
import type { ChatMenuAction } from "@/components/chat/ChatActionMenu";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { EndConversationModal } from "@/components/chat/EndConversationModal";
import { ResumeSessionModal } from "@/components/chat/ResumeSessionModal";
import { InfoSheet } from "@/components/chat/InfoSheet";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import { ErrorState } from "@/components/common/ErrorState";
import { DEFAULT_PERSONA_ID, getPersona } from "@/config/personas";
import { DEFAULT_SCENARIO_ID, getScenario } from "@/config/scenarios";
import {
  clearSession,
  loadCustom,
  loadSelection,
  loadSession,
  saveSession,
  type CustomStore,
} from "@/lib/storage/session-storage";
import {
  CUSTOM_PERSONA_ID,
  CUSTOM_SCENARIO_ID,
  toPersona,
  toScenario,
} from "@/lib/custom";
import { createId } from "@/lib/utils/format-time";
import type { ChatMessage } from "@/types/chat";
import type { SimulationSession } from "@/types/session";
import type { ReviewResult } from "@/types/evaluation";

type SheetState = { title: string; body: React.ReactNode } | null;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function SimulationPage() {
  const router = useRouter();
  const [personaId, setPersonaId] = useState(DEFAULT_PERSONA_ID);
  const [scenarioId, setScenarioId] = useState(DEFAULT_SCENARIO_ID);
  const [selectionReady, setSelectionReady] = useState(false);
  const [custom, setCustom] = useState<CustomStore | null>(null);
  const persona = useMemo(
    () =>
      personaId === CUSTOM_PERSONA_ID && custom?.persona
        ? toPersona(custom.persona)
        : getPersona(personaId),
    [personaId, custom],
  );
  const scenario = useMemo(
    () =>
      scenarioId === CUSTOM_SCENARIO_ID && custom?.scenario
        ? toScenario(custom.scenario)
        : getScenario(scenarioId),
    [scenarioId, custom],
  );
  const customBody = useMemo(
    () => ({
      customPersona: personaId === CUSTOM_PERSONA_ID ? custom?.persona : undefined,
      customScenario: scenarioId === CUSTOM_SCENARIO_ID ? custom?.scenario : undefined,
    }),
    [personaId, scenarioId, custom],
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string>("");
  const [userTurnCount, setUserTurnCount] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState<(() => void) | null>(null);
  const [sheet, setSheet] = useState<SheetState>(null);
  const [endOpen, setEndOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [booted, setBooted] = useState(false);

  const initRef = useRef(false);
  const pendingRef = useRef<SimulationSession | null>(null);

  const maxUserTurns = scenario.maxUserTurns;
  const reachedMax = userTurnCount >= maxUserTurns;

  const persist = useCallback(
    (patch: Partial<SimulationSession>) => {
      const base: SimulationSession = {
        id: sessionId || createId("sess"),
        scenarioId: scenario.id,
        personaId: persona.id,
        status: "in_progress",
        messages,
        userTurnCount,
        hintCount,
        startedAt: new Date().toISOString(),
        mock: mockMode,
      };
      saveSession({ ...base, ...patch });
    },
    [sessionId, scenario.id, persona.id, messages, userTurnCount, hintCount, mockMode],
  );

  const playOpening = useCallback(async (lines: string[]) => {
    for (let i = 0; i < lines.length; i += 1) {
      setTyping(true);
      await wait(i === 0 ? 500 : 900);
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createId("msg"),
          role: "assistant",
          content: lines[i],
          turn: 0,
          createdAt: new Date().toISOString(),
        },
      ]);
      await wait(180);
    }
  }, []);

  const startFresh = useCallback(async () => {
    setError(null);
    setMessages([]);
    setUserTurnCount(0);
    setHintCount(0);
    setTyping(true);
    try {
      const res = await fetch("/api/simulation/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, personaId: persona.id, ...customBody }),
      });
      if (!res.ok) throw new Error("start failed");
      const data = (await res.json()) as {
        sessionId: string;
        openingMessage: string[];
        mock: boolean;
      };
      setSessionId(data.sessionId);
      setMockMode(data.mock);
      await playOpening(data.openingMessage);
    } catch {
      setTyping(false);
      setSessionId(createId("sess"));
      setError("시뮬레이션을 시작하지 못했습니다. 다시 시도해주세요.");
      setRetry(() => () => void startFresh());
    }
  }, [scenario.id, persona.id, customBody, playOpening]);

  // 선택한 페르소나·상황 로딩
  useEffect(() => {
    const saved = loadSession();
    const selection = loadSelection();
    setCustom(loadCustom());
    if (saved && saved.messages.length > 0 && saved.status !== "completed") {
      setPersonaId(saved.personaId);
      setScenarioId(saved.scenarioId);
    } else if (selection) {
      setPersonaId(selection.personaId);
      setScenarioId(selection.scenarioId);
    }
    setSelectionReady(true);
  }, []);

  // 선택 확정 후: 저장된 세션 확인 후 복구 또는 신규 시작
  useEffect(() => {
    if (!selectionReady) return;
    if (initRef.current) return;
    initRef.current = true;

    const saved = loadSession();
    if (saved && saved.messages.length > 0 && saved.status !== "completed") {
      pendingRef.current = saved;
      setResumeOpen(true);
      setBooted(true);
      return;
    }
    setBooted(true);
    void startFresh();
  }, [selectionReady, startFresh]);

  useEffect(() => {
    if (!booted || messages.length === 0) return;
    persist({});
  }, [booted, messages, userTurnCount, hintCount, persist]);

  const sendMessage = useCallback(
    async (text: string, history: ChatMessage[], nextTurn: number) => {
      setSending(true);
      setTyping(true);
      setError(null);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            sessionId,
            scenarioId: scenario.id,
            personaId: persona.id,
            ...customBody,
            messages: history,
            userTurnCount: nextTurn,
          }),
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error || "응답을 받지 못했습니다.");
        }
        const data = (await res.json()) as { reply: string; createdAt: string; mock: boolean };
        setMockMode(data.mock);
        await wait(400);
        setMessages((prev) => [
          ...prev,
          {
            id: createId("msg"),
            role: "assistant",
            content: data.reply,
            turn: nextTurn,
            createdAt: data.createdAt,
          },
        ]);
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "팀장의 응답을 받지 못했습니다. 다시 시도해주세요.";
        setError(message);
        setRetry(() => () => void sendMessage(text, history, nextTurn));
      } finally {
        setTyping(false);
        setSending(false);
      }
    },
    [sessionId, scenario.id, persona.id, customBody],
  );

  const handleSend = useCallback(
    (text: string) => {
      if (sending || typing || reachedMax) return;
      const nextTurn = userTurnCount + 1;
      const userMessage: ChatMessage = {
        id: createId("msg"),
        role: "user",
        content: text,
        turn: nextTurn,
        createdAt: new Date().toISOString(),
      };
      const history = [...messages, userMessage];
      setMessages(history);
      setUserTurnCount(nextTurn);
      void sendMessage(text, history, nextTurn);
    },
    [sending, typing, reachedMax, userTurnCount, messages, sendMessage],
  );

  const runEvaluation = useCallback(async () => {
    setEndOpen(false);
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sessionId,
          scenarioId: scenario.id,
          personaId: persona.id,
          ...customBody,
          messages,
          hintCount,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "평가를 완료하지 못했습니다.");
      }
      const data = (await res.json()) as { evaluation: ReviewResult };
      persist({
        status: "completed",
        completedAt: new Date().toISOString(),
        evaluation: data.evaluation,
      });
      router.push("/report");
    } catch (e) {
      const message = e instanceof Error ? e.message : "평가를 완료하지 못했습니다.";
      setError(message);
      setRetry(() => () => void runEvaluation());
    } finally {
      setEvaluating(false);
    }
  }, [sessionId, scenario.id, persona.id, customBody, messages, hintCount, persist, router]);

  const showHint = useCallback(() => {
    const hint = scenario.hints[hintCount % scenario.hints.length];
    setHintCount((v) => v + 1);
    setSheet({
      title: "대화 힌트",
      body: (
        <>
          <p className="text-[14px] font-semibold text-navy">{hint}</p>
          <p className="mt-3 text-[12px] text-navy-muted">
            힌트는 정답을 알려주지 않습니다. 사용 횟수는 결과 보고서에 표시되지만 점수에서 직접
            감점하지 않습니다.
          </p>
        </>
      ),
    });
  }, [scenario.hints, hintCount]);

  const showScenario = useCallback(() => {
    setSheet({
      title: "시나리오 정보",
      body: (
        <>
          <p className="font-semibold text-navy">{scenario.title}</p>
          <p className="mt-2">{scenario.situation}</p>
          <p className="mt-3 font-semibold text-navy">부서장의 목표</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {scenario.managerGoal.map((goal) => (
              <li key={goal}>{goal}</li>
            ))}
          </ul>
          <p className="mt-3 text-[12px] text-navy-muted">
            현재 진행: 부서장 응답 {userTurnCount} / {maxUserTurns}회 (권장{" "}
            {scenario.recommendedUserTurns}회 이상)
          </p>
        </>
      ),
    });
  }, [scenario, userTurnCount, maxUserTurns]);

  const handleMenu = useCallback(
    (action: ChatMenuAction) => {
      if (action === "scenario") return showScenario();
      if (action === "reset") return setResetOpen(true);
      if (action === "end") return setEndOpen(true);
      setSheet({
        title: "도움말",
        body: (
          <>
            <p>
              부서장 입장에서 팀장과 대화하십시오. 팀장은 막연한 격려에는 쉽게 설득되지 않습니다.
              구체적인 경험, 사례, 지원 방안이 있을 때 태도가 조금씩 바뀝니다.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-4">
              <li>Enter 전송, Shift+Enter 줄바꿈</li>
              <li>왼쪽 + 버튼에서 시나리오 정보와 힌트를 볼 수 있습니다</li>
              <li>대화 종료는 오른쪽 위 메뉴에서 선택합니다</li>
              <li>권장 {scenario.recommendedUserTurns}회 이상, 최대 {maxUserTurns}회까지 응답할 수 있습니다</li>
            </ul>
            <p className="mt-3 text-[12px] text-navy-muted">
              점수는 진단이 아니라 대화 수행 점수입니다.
            </p>
          </>
        ),
      });
    },
    [showScenario, scenario.recommendedUserTurns, maxUserTurns],
  );

  const noticeVisible = useMemo(
    () => userTurnCount >= scenario.recommendedUserTurns && !evaluating,
    [userTurnCount, scenario.recommendedUserTurns, evaluating],
  );

  return (
    <PhoneFrame>
      <ChatHeader
        persona={persona}
        onBack={() => router.push("/")}
        onMenuSelect={handleMenu}
        onEnd={() => setEndOpen(true)}
        userTurnCount={userTurnCount}
        maxUserTurns={maxUserTurns}
      />

      <ChatMessageList
        messages={messages}
        typing={typing}
        personaName={persona.name}
        personaImage={persona.profileImage}
      />

      {error ? (
        <ErrorState
          message={error}
          onRetry={
            retry
              ? () => {
                  const fn = retry;
                  setRetry(null);
                  setError(null);
                  fn();
                }
              : undefined
          }
          onDismiss={() => setError(null)}
        />
      ) : null}

      {noticeVisible ? (
        <div className="flex items-center justify-between gap-2 border-t border-[#EFEFEF] bg-[#FFFBEC] px-3 py-2">
          <p className="text-[11.5px] leading-snug text-[#5A4A16]">
            {reachedMax
              ? `최대 응답 횟수(${maxUserTurns}회)에 도달했습니다. 점검을 진행해주세요.`
              : "현재까지의 대화로 점검을 진행할 수 있습니다."}
          </p>
          <button
            type="button"
            onClick={() => setEndOpen(true)}
            className="shrink-0 rounded-lg bg-navy px-2.5 py-1.5 text-[11.5px] font-semibold text-white"
          >
            대화 종료
          </button>
        </div>
      ) : null}

      <ChatComposer
        disabled={sending || typing || evaluating || reachedMax}
        onSend={handleSend}
        onShowScenario={showScenario}
        onShowHint={showHint}
        onEnd={() => setEndOpen(true)}
      />

      <InfoSheet
        open={sheet !== null}
        title={sheet?.title ?? ""}
        body={sheet?.body ?? null}
        onClose={() => setSheet(null)}
      />

      <EndConversationModal
        open={endOpen}
        userTurnCount={userTurnCount}
        onCancel={() => setEndOpen(false)}
        onConfirm={() => void runEvaluation()}
      />

      <ConfirmModal
        open={resetOpen}
        title="대화를 초기화할까요?"
        description="지금까지의 대화가 모두 삭제되고 처음부터 다시 시작합니다."
        cancelLabel="취소"
        confirmLabel="초기화"
        tone="danger"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          setResetOpen(false);
          clearSession();
          void startFresh();
        }}
      />

      <ResumeSessionModal
        open={resumeOpen}
        onResume={() => {
          const saved = pendingRef.current;
          setResumeOpen(false);
          if (!saved) return;
          setSessionId(saved.id);
          setMessages(saved.messages);
          setUserTurnCount(saved.userTurnCount);
          setHintCount(saved.hintCount);
          setMockMode(Boolean(saved.mock));
        }}
        onRestart={() => {
          setResumeOpen(false);
          clearSession();
          void startFresh();
        }}
      />

      <LoadingOverlay
        open={evaluating}
        title="대화를 점검하고 있습니다"
        description="부서장의 발언을 네 가지 축으로 확인하는 중입니다."
      />
    </PhoneFrame>
  );
}

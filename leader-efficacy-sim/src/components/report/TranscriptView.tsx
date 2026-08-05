"use client";

import { useMemo, useState } from "react";
import type { ChatMessage } from "@/types/chat";
import type { ReviewResult } from "@/types/evaluation";
import { formatChatTime } from "@/lib/utils/format-time";

type Props = { messages: ChatMessage[]; personaName: string; evaluation: ReviewResult };

export function TranscriptView({ messages, personaName, evaluation }: Props) {
  const [open, setOpen] = useState(false);

  const tagsByTurn = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const axis of evaluation.axes) {
      for (const criterion of axis.criteria) {
        for (const evidence of criterion.evidence) {
          if (!map.has(evidence.turn)) map.set(evidence.turn, new Set());
          map.get(evidence.turn)?.add(`${axis.title} 근거`);
        }
      }
    }
    return map;
  }, [evaluation]);

  const rows = useMemo(() => {
    let userIdx = 0;
    let aiIdx = 0;
    return messages.map((m) => {
      if (m.role === "user") {
        userIdx += 1;
        return { ...m, label: `부서장 ${userIdx}`, index: userIdx };
      }
      aiIdx += 1;
      return { ...m, label: `${personaName} 팀장 ${aiIdx}`, index: aiIdx };
    });
  }, [messages, personaName]);

  return (
    <section className="rounded-2xl border border-hair bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-navy">전체 대화 다시 보기</h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="text-[12.5px] font-semibold text-gold hover:underline"
        >
          {open ? "접기" : "펼쳐보기"}
        </button>
      </div>

      {open ? (
        <ol className="mt-4 space-y-3">
          {rows.map((row) => {
            const isUser = row.role === "user";
            const tags = isUser ? Array.from(tagsByTurn.get(row.index) ?? []) : [];
            return (
              <li
                key={row.id}
                className={`rounded-xl border p-3.5 ${
                  isUser ? "border-gold/40 bg-[#FFFDF6]" : "border-hair bg-white"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11.5px] font-semibold text-navy">{row.label}</p>
                  <span className="text-[11px] text-navy-muted">{formatChatTime(row.createdAt)}</span>
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-gold-pale px-1.5 py-0.5 text-[10px] text-[#7A5B14]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 whitespace-pre-wrap break-anywhere text-[13px] leading-relaxed text-navy-soft">
                  {row.content}
                </p>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-2 text-[12.5px] text-navy-muted">
          총 {messages.length}개의 메시지가 기록되어 있습니다.
        </p>
      )}
    </section>
  );
}

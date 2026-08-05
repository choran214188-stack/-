"use client";

import { useState } from "react";
import type { Persona } from "@/types/persona";
import { BackIcon, KebabIcon } from "./icons";
import { ChatActionMenu, type ChatMenuAction } from "./ChatActionMenu";

type Props = {
  persona: Persona;
  onBack: () => void;
  onMenuSelect: (action: ChatMenuAction) => void;
  onEnd: () => void;
  userTurnCount: number;
  maxUserTurns: number;
};

export function ChatHeader({
  persona,
  onBack,
  onMenuSelect,
  onEnd,
  userTurnCount,
  maxUserTurns,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const turnLabel = `대화 ${userTurnCount} / ${maxUserTurns}`;

  return (
    <header className="relative z-20 flex h-[56px] shrink-0 items-center gap-1 border-b border-[#ECECEC] bg-white px-2 sm:h-[60px]">
      <button
        type="button"
        onClick={onBack}
        aria-label="시작 화면으로 돌아가기"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/5"
      >
        <BackIcon className="h-[22px] w-[22px]" />
      </button>

      <div className="min-w-0 flex-1 pl-0.5">
        <p className="truncate text-[16px] font-bold leading-tight text-[#111318]">
          {persona.name}
        </p>
        {persona.subtitle ? (
          <p className="truncate text-[11.5px] leading-tight text-[#8B919C]">{persona.subtitle}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onEnd}
        className="flex h-8 items-center rounded-full bg-[#111318] px-3 text-[12px] font-semibold text-white transition hover:bg-[#2B3B5B]"
      >
        대화 종료
      </button>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="대화 메뉴 열기"
        aria-expanded={menuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A1A1A] hover:bg-black/5"
      >
        <KebabIcon className="h-5 w-5" />
      </button>

      <ChatActionMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSelect={onMenuSelect}
        turnLabel={turnLabel}
      />
    </header>
  );
}

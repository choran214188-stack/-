"use client";

import { useState } from "react";
import type { Persona } from "@/types/persona";
import { PersonaAvatar } from "./PersonaAvatar";
import { BackIcon, KebabIcon } from "./icons";
import { ChatActionMenu, type ChatMenuAction } from "./ChatActionMenu";

type Props = {
  persona: Persona;
  onBack: () => void;
  onMenuSelect: (action: ChatMenuAction) => void;
  userTurnCount: number;
  maxUserTurns: number;
};

export function ChatHeader({ persona, onBack, onMenuSelect, userTurnCount, maxUserTurns }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const turnLabel = `대화 ${userTurnCount} / ${maxUserTurns}`;

  return (
    <header className="relative z-20 flex h-[74px] shrink-0 items-end gap-2.5 bg-chat-header px-3 pb-3 sm:h-[96px] sm:pb-3.5">
      <button
        type="button"
        onClick={onBack}
        aria-label="시작 화면으로 돌아가기"
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#1E1E1E] hover:bg-black/5"
      >
        <BackIcon className="h-5 w-5" />
      </button>

      <PersonaAvatar name={persona.name} profileImage={persona.profileImage} size={34} />

      <div className="min-w-0 flex-1 pb-0.5">
        <p className="truncate text-[16px] font-bold leading-tight text-[#12151C]">{persona.name}</p>
        <p className="truncate text-[11.5px] leading-tight text-[#4E5560]">{persona.subtitle}</p>
      </div>

      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="대화 메뉴 열기"
        aria-expanded={menuOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full text-[#1E1E1E] hover:bg-black/5"
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

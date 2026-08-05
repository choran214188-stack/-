"use client";

import { useEffect, useRef } from "react";

export type ChatMenuAction = "scenario" | "reset" | "end" | "help";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (action: ChatMenuAction) => void;
  turnLabel: string;
};

const ITEMS: Array<{ action: ChatMenuAction; label: string }> = [
  { action: "scenario", label: "시나리오 정보" },
  { action: "reset", label: "대화 초기화" },
  { action: "end", label: "대화 종료" },
  { action: "help", label: "도움말" },
];

export function ChatActionMenu({ open, onClose, onSelect, turnLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 닫기"
        className="absolute inset-0 z-30 cursor-default"
        onClick={onClose}
      />
      <div
        ref={ref}
        role="menu"
        className="absolute right-3 top-[68px] z-40 w-[176px] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-navy/10 sm:top-[86px]"
      >
        <p className="border-b border-line px-3.5 py-2 text-[11px] text-navy-muted">{turnLabel}</p>
        {ITEMS.map((item) => (
          <button
            key={item.action}
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onSelect(item.action);
            }}
            className="block w-full px-3.5 py-2.5 text-left text-[13px] text-navy hover:bg-ivory"
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

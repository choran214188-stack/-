"use client";

import { useCallback, useRef, useState } from "react";
import { EmojiIcon, ImageIcon, PlusIcon, SendIcon } from "./icons";

type Props = {
  disabled: boolean;
  onSend: (text: string) => void;
  onShowScenario: () => void;
  onShowHint: () => void;
  onEnd: () => void;
};

const MAX_ROWS_PX = 108;

export function ChatComposer({ disabled, onSend, onShowScenario, onShowHint, onEnd }: Props) {
  const [value, setValue] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const composingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = value.trim().length > 0 && !disabled;

  const resize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_ROWS_PX)}px`;
    el.style.overflowY = el.scrollHeight > MAX_ROWS_PX ? "auto" : "hidden";
  }, []);

  const submit = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.style.height = "auto";
        el.focus();
      }
    });
  }, [value, disabled, onSend]);

  return (
    <div className="relative shrink-0 border-t border-[#EDEDED] bg-white px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      {plusOpen ? (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="fixed inset-0 z-30 cursor-default"
            onClick={() => setPlusOpen(false)}
          />
          <div
            role="menu"
            className="absolute bottom-[64px] left-3 z-40 w-[184px] overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-navy/10"
          >
            {[
              { label: "시나리오 정보 보기", action: onShowScenario },
              { label: "대화 힌트 보기", action: onShowHint },
              { label: "대화 종료", action: onEnd },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setPlusOpen(false);
                  item.action();
                }}
                className="block w-full px-3.5 py-2.5 text-left text-[13px] text-navy hover:bg-ivory"
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className="flex items-end gap-1.5">
        <button
          type="button"
          onClick={() => setPlusOpen((v) => !v)}
          aria-label="추가 기능 열기"
          aria-expanded={plusOpen}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C6470] hover:bg-[#F2F2F2]"
        >
          <PlusIcon className="h-5 w-5" />
        </button>

        <label htmlFor="chat-input" className="sr-only">
          메시지 입력
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
          placeholder="메시지를 입력하세요"
          onChange={(e) => {
            setValue(e.target.value);
            resize();
          }}
          onCompositionStart={() => {
            composingRef.current = true;
          }}
          onCompositionEnd={() => {
            composingRef.current = false;
          }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            if (e.shiftKey) return;
            if (composingRef.current || e.nativeEvent.isComposing) return;
            e.preventDefault();
            submit();
          }}
          className="chat-scroll max-h-[108px] flex-1 resize-none rounded-[20px] bg-[#F1F2F3] px-3.5 py-2.5 text-[14px] leading-[1.45] text-[#1F2430] outline-none placeholder:text-[#9AA0AA] disabled:opacity-60"
        />

        {canSend ? (
          <button
            type="button"
            onClick={submit}
            aria-label="메시지 보내기"
            className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-chat-mine text-[#1E1E1E] hover:brightness-95"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        ) : (
          <>
            <button
              type="button"
              title="추후 지원 예정"
              aria-label="이모지 (추후 지원 예정)"
              className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C6470] hover:bg-[#F2F2F2]"
            >
              <EmojiIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="추후 지원 예정"
              aria-label="이미지 첨부 (추후 지원 예정)"
              className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#5C6470] hover:bg-[#F2F2F2]"
            >
              <ImageIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

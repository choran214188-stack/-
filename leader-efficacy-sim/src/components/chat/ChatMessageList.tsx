"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/chat";
import { ChatBubble } from "./ChatBubble";
import { ChatDateDivider } from "./ChatDateDivider";
import { TypingIndicator } from "./TypingIndicator";

type Props = {
  messages: ChatMessage[];
  typing: boolean;
  personaName: string;
};

function shouldShowTime(messages: ChatMessage[], index: number): boolean {
  const current = messages[index];
  const next = messages[index + 1];
  if (!next) return true;
  if (next.role !== current.role) return true;
  return formatMinute(next.createdAt) !== formatMinute(current.createdAt);
}

function formatMinute(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${d.getMinutes()}`;
}

export function ChatMessageList({ messages, typing, personaName }: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  return (
    <div
      className="chat-scroll flex-1 overflow-y-auto bg-chat-bg px-3.5 py-3"
      role="log"
      aria-label="대화 내용"
      aria-live="polite"
    >
      <div className="flex min-h-full flex-col gap-2.5">
        {messages.length > 0 ? <ChatDateDivider createdAt={messages[0].createdAt} /> : null}
        {messages.map((message, index) => (
          <ChatBubble
            key={message.id}
            message={message}
            showTime={shouldShowTime(messages, index)}
          />
        ))}
        {typing ? <TypingIndicator name={personaName} /> : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}

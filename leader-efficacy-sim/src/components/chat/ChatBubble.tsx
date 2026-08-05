import type { ChatMessage } from "@/types/chat";
import { ChatTimestamp } from "./ChatTimestamp";

type Props = { message: ChatMessage; showTime: boolean };

export function ChatBubble({ message, showTime }: Props) {
  const isUser = message.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[74%] animate-popIn">
        <div
          className={
            isUser
              ? "rounded-2xl rounded-tr-md bg-chat-mine px-3.5 py-2.5 text-[14.5px] leading-[1.5] text-[#1A1A1A] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
              : "rounded-2xl rounded-tl-md bg-white px-3.5 py-2.5 text-[14.5px] leading-[1.5] text-[#33383F] shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
          }
        >
          <p className="whitespace-pre-wrap break-anywhere">{message.content}</p>
        </div>
        {showTime ? (
          <ChatTimestamp createdAt={message.createdAt} align={isUser ? "right" : "left"} />
        ) : null}
      </div>
    </div>
  );
}

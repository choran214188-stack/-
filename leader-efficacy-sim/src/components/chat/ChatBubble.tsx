import type { ChatMessage } from "@/types/chat";
import { ChatTimestamp } from "./ChatTimestamp";
import { PersonaAvatar } from "./PersonaAvatar";

type Props = {
  message: ChatMessage;
  showTime: boolean;
  personaName: string;
  personaImage?: string;
  showAvatar: boolean;
};

export function ChatBubble({ message, showTime, personaName, personaImage, showAvatar }: Props) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-[76%] items-end gap-1.5">
          {showTime ? (
            <ChatTimestamp createdAt={message.createdAt} align="right" />
          ) : null}
          <div className="animate-popIn rounded-2xl rounded-tr-sm bg-chat-mine px-3.5 py-2.5 text-[14.5px] leading-[1.5] text-[#1A1A1A] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
            <p className="whitespace-pre-wrap break-anywhere">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div className="mr-1 w-9 shrink-0">
        {showAvatar ? (
          <PersonaAvatar name={personaName} profileImage={personaImage} size={36} />
        ) : null}
      </div>
      <div className="max-w-[76%]">
        {showAvatar ? (
          <p className="mb-1 pl-0.5 text-[12.5px] text-[#3B4453]">{personaName}</p>
        ) : null}
        <div className="flex items-end gap-1.5">
          <div className="animate-popIn rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[14.5px] leading-[1.5] text-[#33383F] shadow-[0_1px_1px_rgba(0,0,0,0.06)]">
            <p className="whitespace-pre-wrap break-anywhere">{message.content}</p>
          </div>
          {showTime ? (
            <ChatTimestamp createdAt={message.createdAt} align="left" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

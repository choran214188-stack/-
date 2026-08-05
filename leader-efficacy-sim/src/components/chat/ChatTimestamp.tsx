import { formatChatTime } from "@/lib/utils/format-time";

type Props = { createdAt: string; align: "left" | "right" };

export function ChatTimestamp({ createdAt, align }: Props) {
  return (
    <span
      className={`mt-1 block text-[10px] text-[#5D6B69] ${align === "right" ? "text-right" : "text-left"}`}
    >
      {formatChatTime(createdAt)}
    </span>
  );
}

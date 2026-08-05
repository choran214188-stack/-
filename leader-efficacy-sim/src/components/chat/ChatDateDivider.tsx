import { formatChatDate } from "@/lib/utils/format-time";

export function ChatDateDivider({ createdAt }: { createdAt: string }) {
  return (
    <div className="my-1 flex justify-center">
      <span className="rounded-full bg-white/45 px-3 py-1 text-[11px] text-[#3F4C4A]">
        {formatChatDate(createdAt)}
      </span>
    </div>
  );
}

import { formatChatDate } from "@/lib/utils/format-time";

export function ChatDateDivider({ createdAt }: { createdAt: string }) {
  return (
    <div className="my-1 flex justify-center">
      <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] text-[#33404F]">
        {formatChatDate(createdAt)}
      </span>
    </div>
  );
}

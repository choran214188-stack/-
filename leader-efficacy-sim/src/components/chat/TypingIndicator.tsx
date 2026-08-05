type Props = { name: string; showLabel?: boolean };

export function TypingIndicator({ name, showLabel = true }: Props) {
  return (
    <div className="flex flex-col items-start gap-1" role="status" aria-live="polite">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-md bg-white px-3.5 py-3 shadow-[0_1px_1px_rgba(0,0,0,0.05)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#9AA5A3] animate-blink" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9AA5A3] animate-blink [animation-delay:180ms]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#9AA5A3] animate-blink [animation-delay:360ms]" />
      </div>
      {showLabel ? (
        <span className="text-[10px] text-[#4A5654]">{name} 팀장이 입력 중입니다</span>
      ) : null}
    </div>
  );
}

"use client";

type Props = { open: boolean; title: string; description?: string };

export function LoadingOverlay({ open, title, description }: Props) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-ivory/95 px-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-2.5 w-2.5 rounded-full bg-gold animate-blink" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold animate-blink [animation-delay:180ms]" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold animate-blink [animation-delay:360ms]" />
      </div>
      <p className="text-[14px] font-semibold text-navy">{title}</p>
      {description ? <p className="text-[12px] text-navy-muted">{description}</p> : null}
    </div>
  );
}

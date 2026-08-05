"use client";

type Props = {
  open: boolean;
  title: string;
  body: React.ReactNode;
  onClose: () => void;
};

export function InfoSheet({ open, title, body, onClose }: Props) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-navy/35">
      <button type="button" aria-label="닫기" className="absolute inset-0" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 max-h-[70%] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-7 pt-4 animate-popIn"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
        <h2 className="text-[15px] font-bold text-navy">{title}</h2>
        <div className="mt-3 text-[13px] leading-relaxed text-navy-soft">{body}</div>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-navy py-2.5 text-[13px] font-semibold text-white"
        >
          닫기
        </button>
      </div>
    </div>
  );
}

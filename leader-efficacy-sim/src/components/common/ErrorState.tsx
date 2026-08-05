"use client";

type Props = { message: string; onRetry?: () => void; onDismiss?: () => void };

export function ErrorState({ message, onRetry, onDismiss }: Props) {
  return (
    <div
      role="alert"
      className="mx-3 mb-2 rounded-xl border border-[#D9C3C3] bg-[#FBEFEF] px-3 py-2.5 text-[12px] text-[#7A2E2E]"
    >
      <p className="break-anywhere">{message}</p>
      <div className="mt-2 flex gap-2">
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-[#7A2E2E] px-2.5 py-1 text-[12px] font-semibold text-white"
          >
            다시 시도
          </button>
        ) : null}
        {onDismiss ? (
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg border border-[#D9C3C3] px-2.5 py-1 text-[12px] font-semibold text-[#7A2E2E]"
          >
            닫기
          </button>
        ) : null}
      </div>
    </div>
  );
}

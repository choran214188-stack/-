"use client";

import { ConfirmModal } from "@/components/common/ConfirmModal";

type Props = { open: boolean; userTurnCount: number; onCancel: () => void; onConfirm: () => void };

export function EndConversationModal({ open, userTurnCount, onCancel, onConfirm }: Props) {
  const short = userTurnCount < 6;
  return (
    <ConfirmModal
      open={open}
      title="대화를 종료할까요?"
      description={`지금 대화를 종료하면 현재까지의 대화만 점검합니다.\n아직 다루지 않은 항목은 미확인으로 표시됩니다.${
        short ? `\n\n현재 부서장 응답은 ${userTurnCount}회입니다. 권장 응답 횟수는 6회입니다.` : ""
      }`}
      cancelLabel="대화 계속하기"
      confirmLabel="종료하고 점검하기"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

"use client";

import { ConfirmModal } from "@/components/common/ConfirmModal";

type Props = { open: boolean; userTurnCount: number; onCancel: () => void; onConfirm: () => void };

export function EndConversationModal({ open, userTurnCount, onCancel, onConfirm }: Props) {
  return (
    <ConfirmModal
      open={open}
      title="대화를 종료할까요?"
      description={`지금까지의 대화(부서장 응답 ${userTurnCount}회)를 기준으로 점검합니다.\n더 이어가고 싶다면 계속 대화해도 됩니다.`}
      cancelLabel="대화 계속하기"
      confirmLabel="종료하고 점검하기"
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}

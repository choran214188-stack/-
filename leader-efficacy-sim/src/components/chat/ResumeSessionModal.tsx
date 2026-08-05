"use client";

import { ConfirmModal } from "@/components/common/ConfirmModal";

type Props = { open: boolean; onResume: () => void; onRestart: () => void };

export function ResumeSessionModal({ open, onResume, onRestart }: Props) {
  return (
    <ConfirmModal
      open={open}
      title="진행 중이던 대화가 있습니다."
      description="이어서 진행하거나 처음부터 새로 시작할 수 있습니다."
      cancelLabel="새로 시작"
      confirmLabel="이어서 진행"
      onCancel={onRestart}
      onConfirm={onResume}
    />
  );
}

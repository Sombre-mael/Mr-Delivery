"use client";

import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = {
  idleLabel: string;
  pendingLabel?: string;
  className: string;
};

export function PendingSubmitButton({ idleLabel, pendingLabel = "Enregistrement...", className }: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className={className} aria-disabled={pending}>
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}

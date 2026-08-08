export type HapticKind = "select" | "success" | "error";

const patterns: Record<HapticKind, number | number[]> = {
  select: 10,
  success: [12, 28, 12],
  error: 28,
};

export function triggerHaptic(kind: HapticKind) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(patterns[kind]);
}

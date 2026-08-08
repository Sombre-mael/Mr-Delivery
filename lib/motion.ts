export const motion = {
  duration: { instant: 0.18, fast: 0.3, base: 0.46, slow: 0.72 },
  ease: { enter: "power3.out", exit: "power2.inOut", soft: "power2.out", spring: "back.out(1.45)" },
  mobile: { distance: 12, stagger: 0.055 },
  desktop: { distance: 28, stagger: 0.08 },
} as const;

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

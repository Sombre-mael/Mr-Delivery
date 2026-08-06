"use server";

import { redirect } from "next/navigation";
import { normalizeTrackingCode } from "@/lib/order-utils";

export async function trackOrderAction(formData: FormData) {
  const rawCode = String(formData.get("trackingCode") || "");

  if (!rawCode.trim()) {
    redirect("/track?error=missing");
  }

  const code = normalizeTrackingCode(rawCode);
  if (!code) {
    redirect("/track?error=invalid");
  }

  redirect(`/track/${encodeURIComponent(code)}`);
}

"use server";

import { redirect } from "next/navigation";

export async function trackOrderAction(formData: FormData) {
  const code = String(formData.get("trackingCode") || "")
    .trim()
    .toUpperCase();

  if (!code) {
    redirect("/track?error=missing");
  }

  redirect(`/track/${encodeURIComponent(code)}`);
}

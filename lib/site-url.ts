const PRODUCTION_URL = "https://mr-delivery-nine.vercel.app";

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  const isLocalUrl = configured ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configured) : false;

  if (configured && !(process.env.NODE_ENV === "production" && isLocalUrl)) {
    return configured.replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.NODE_ENV === "production" ? PRODUCTION_URL : "http://localhost:3000";
}

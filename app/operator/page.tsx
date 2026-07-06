import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { OperatorConsole } from "@/components/OperatorConsole";
import { isOperatorAuthenticated } from "@/lib/operator-auth";
import { listOrders } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Console operateur | Mr. Delivery",
  description: "Outil interne Mr. Delivery pour relances WhatsApp et factures QR.",
  robots: {
    index: false,
    follow: false,
  },
};

type OperatorPageProps = {
  searchParams?: Promise<{ order?: string }>;
};

async function getAppUrl() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export default async function OperatorPage({ searchParams }: OperatorPageProps) {
  if (!(await isOperatorAuthenticated())) {
    redirect("/operator/login");
  }

  const params = await searchParams;
  const appUrl = await getAppUrl();

  try {
    const orders = await listOrders();

    return <OperatorConsole orders={orders} selectedTrackingCode={params?.order} appUrl={appUrl} />;
  } catch (error) {
    console.error("Operator database configuration error", error);

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
        <section className="w-full max-w-xl rounded-2xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Configuration Neon</p>
          <h1 className="mt-2 text-3xl font-black">Connexion base de donnees impossible</h1>
          <p className="mt-4 text-sm leading-7 text-neutral-600">
            Verifiez la variable `DATABASE_URL` dans Vercel. Elle doit contenir la vraie connection string Neon, pas le
            modele avec `USER`, `PASSWORD` ou `HOST`.
          </p>
          <div className="mt-5 rounded-lg bg-ink p-4 text-sm font-semibold leading-6 text-white/75">
            Exemple attendu: `postgresql://neondb_owner:mot-de-passe@ep-...pooler.../neondb?sslmode=require`
          </div>
          <a
            href="/"
            className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white"
          >
            Retour au site
          </a>
        </section>
      </main>
    );
  }
}

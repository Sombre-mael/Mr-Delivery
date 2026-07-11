import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/operator/actions";
import { isOperatorAuthenticated } from "@/lib/operator-auth";

export const metadata: Metadata = {
  title: "Connexion équipe | Mr. Delivery",
  description: "Accès équipe Mr. Delivery.",
  robots: {
    index: false,
    follow: false,
  },
};

type OperatorLoginPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function OperatorLoginPage({ searchParams }: OperatorLoginPageProps) {
  if (await isOperatorAuthenticated()) {
    redirect("/operator");
  }

  const params = await searchParams;
  const hasError = params?.error === "1";
  const hasConfigError = params?.error === "config";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-12 text-ink">
      <section className="w-full max-w-md rounded-2xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3">
          <Image
            src="/logo-mr-delivery.jpeg"
            alt="Logo Mr. Delivery"
            width={52}
            height={52}
            className="h-12 w-12 rounded-xl object-cover"
          />
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-gold">Mr. Delivery</p>
            <h1 className="text-2xl font-black">Espace équipe</h1>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-neutral-600">
          Connectez-vous pour gérer les commandes, les statuts colis et les factures QR.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.12em] text-neutral-500">Mot de passe</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15"
            />
          </label>

          {hasError ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Mot de passe incorrect.
            </p>
          ) : null}

          {hasConfigError ? (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Configuration admin invalide. Vérifiez `ADMIN_PASSWORD_HASH` et `SESSION_SECRET` dans Vercel.
            </p>
          ) : null}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-gold hover:text-ink"
          >
            Entrer dans le panel
          </button>
        </form>

        <a href="/" className="mt-5 inline-flex text-sm font-black text-neutral-500 transition hover:text-gold">
          Retour au site principal
        </a>
      </section>
    </main>
  );
}

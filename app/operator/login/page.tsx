import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/app/operator/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { getOperatorIdentity, isEmergencyAccessEnabled } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Connexion équipe | Mr. Delivery",
  description: "Accès réservé à l’équipe Mr. Delivery.",
  robots: { index: false, follow: false },
};

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function OperatorLoginPage({ searchParams }: Props) {
  const identity = await getOperatorIdentity();
  if (identity) redirect(identity.mustChangePassword ? "/operator/change-password" : "/operator");
  const params = await searchParams;

  const errorMessage = params?.error === "blocked"
    ? "Trop de tentatives. Réessaie dans 15 minutes."
    : params?.error === "session"
      ? "Ta session a expiré. Connecte-toi à nouveau."
      : params?.error
        ? "Connexion impossible. Vérifie tes informations et réessaie."
        : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-10 text-ink">
      <section className="w-full max-w-md rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/logo-mr-delivery.jpeg" alt="Logo Mr. Delivery" width={52} height={52} className="h-12 w-12 rounded-lg object-cover" />
          <div><p className="text-xs font-black uppercase text-gold">Mr. Delivery</p><h1 className="text-2xl font-black">Espace équipe</h1></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-neutral-600">Connecte-toi avec le compte créé par ton administrateur.</p>

        {errorMessage ? <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMessage}</p> : null}

        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Adresse e-mail</span><input name="email" type="email" required maxLength={160} autoComplete="username" className="mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15" placeholder="nom@exemple.com" /></label>
          <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Mot de passe</span><input name="password" type="password" required maxLength={128} autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15" /></label>
          <PendingSubmitButton idleLabel="Se connecter" pendingLabel="Connexion..." className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-black text-white shadow-soft transition hover:bg-gold hover:text-ink disabled:cursor-wait disabled:opacity-60" />
        </form>

        <div className="mt-5 rounded-lg bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-600"><span className="font-black text-ink">Mot de passe oublié ?</span> Contacte un administrateur pour recevoir un nouvel accès temporaire.</div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-black">
          <Link href="/" className="text-neutral-500 transition hover:text-gold">Retour au site principal</Link>
          {isEmergencyAccessEnabled() ? <Link href="/operator/secours" className="text-amber-700 transition hover:text-ink">Accès administrateur de secours</Link> : null}
        </div>
      </section>
    </main>
  );
}

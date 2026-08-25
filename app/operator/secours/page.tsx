import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { emergencyLoginAction } from "@/app/operator/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { getOperatorIdentity, isEmergencyAccessEnabled } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accès de secours | Mr. Delivery",
  robots: { index: false, follow: false },
};

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function EmergencyAccessPage({ searchParams }: Props) {
  if (!isEmergencyAccessEnabled()) notFound();
  const identity = await getOperatorIdentity();
  if (identity && !identity.mustChangePassword) redirect("/operator");
  const params = await searchParams;
  const errorMessage = params?.error === "blocked"
    ? "Trop de tentatives. Réessaie dans 15 minutes."
    : params?.error
      ? "L’accès n’a pas pu être confirmé."
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-white p-6 text-ink shadow-2xl sm:p-8">
        <div className="flex items-center gap-3"><Image src="/logo-mr-delivery.jpeg" alt="Mr. Delivery" width={52} height={52} className="h-12 w-12 rounded-lg object-cover" /><div><p className="text-xs font-black uppercase text-gold">Administration</p><h1 className="text-2xl font-black">Accès de secours</h1></div></div>
        <p className="mt-5 text-sm leading-6 text-neutral-600">Utilise cet accès uniquement pour initialiser ou récupérer les comptes de l’équipe. La session se ferme automatiquement après 30 minutes.</p>
        {errorMessage ? <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMessage}</p> : null}
        <form action={emergencyLoginAction} className="mt-6 space-y-4">
          <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Mot de passe de secours</span><input name="password" type="password" required autoComplete="current-password" className="mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15" /></label>
          <PendingSubmitButton idleLabel="Ouvrir la session de secours" pendingLabel="Vérification..." className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-6 py-3 text-sm font-black text-ink transition hover:bg-ink hover:text-white disabled:opacity-60" />
        </form>
        <a href="/operator/login" className="mt-5 inline-flex text-sm font-black text-neutral-500 hover:text-ink">Retour à la connexion</a>
      </section>
    </main>
  );
}

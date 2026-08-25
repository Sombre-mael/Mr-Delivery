import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { changePasswordAction, logoutAction } from "@/app/operator/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import { requireOperatorIdentity } from "@/lib/operator-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Créer mon mot de passe | Mr. Delivery",
  robots: { index: false, follow: false },
};

type Props = { searchParams?: Promise<{ error?: string }> };

export default async function ChangePasswordPage({ searchParams }: Props) {
  const identity = await requireOperatorIdentity({ allowPasswordChange: true });
  if (identity.authMode !== "account" || !identity.mustChangePassword) redirect("/operator");
  const params = await searchParams;
  const errorMessage = params?.error === "confirmation"
    ? "Les deux mots de passe ne correspondent pas."
    : params?.error;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fffdf7] px-4 py-10 text-ink">
      <section className="w-full max-w-md rounded-xl border border-ink/10 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-3">
          <Image src="/logo-mr-delivery.jpeg" alt="Mr. Delivery" width={52} height={52} className="h-12 w-12 rounded-lg object-cover" />
          <div><p className="text-xs font-black uppercase text-gold">Première connexion</p><h1 className="text-2xl font-black">Crée ton mot de passe</h1></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-neutral-600">Bonjour {identity.displayName}. Remplace le mot de passe temporaire avant d’accéder à ton espace de travail.</p>

        {errorMessage ? <p role="alert" className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{errorMessage}</p> : null}

        <form action={changePasswordAction} className="mt-6 space-y-4">
          <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Nouveau mot de passe</span><input name="password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15" /></label>
          <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Confirmer le mot de passe</span><input name="confirmation" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className="mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15" /></label>
          <p className="text-xs leading-5 text-neutral-500">Utilise au moins 12 caractères. Une phrase longue est plus facile à retenir et plus difficile à deviner.</p>
          <PendingSubmitButton idleLabel="Enregistrer et continuer" pendingLabel="Sécurisation en cours..." className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:opacity-60" />
        </form>

        <form action={logoutAction} className="mt-4 text-center"><button type="submit" className="text-sm font-black text-neutral-500 hover:text-ink">Se déconnecter</button></form>
      </section>
    </main>
  );
}

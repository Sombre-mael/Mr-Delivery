"use client";

import { useActionState, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clipboard,
  Clock3,
  KeyRound,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  createOperatorAction,
  resetOperatorPasswordAction,
  toggleOperatorAction,
  updateOperatorRoleAction,
  type CredentialActionState,
} from "@/app/operator/team/actions";
import { PendingSubmitButton } from "@/components/PendingSubmitButton";
import type { OperatorIdentity } from "@/lib/operator-auth";
import type { OperatorActivity, OperatorMember } from "@/lib/operator-members";

type Props = {
  identity: OperatorIdentity;
  members: OperatorMember[];
  activity: OperatorActivity[];
  errorMessage?: string;
  savedState?: string;
};

const initialCredentialActionState: CredentialActionState = { status: "idle" };

const inputClass = "mt-2 min-h-12 w-full rounded-lg border border-ink/10 bg-[#fffdf7] px-4 py-3 text-sm font-semibold outline-none focus:border-gold focus:ring-4 focus:ring-gold/15";

function formatDate(value: string) {
  if (!value) return "Jamais";
  return new Intl.DateTimeFormat("fr-CD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function TemporaryCredential({ state }: { state: CredentialActionState }) {
  const [copied, setCopied] = useState(false);
  if (state.status === "idle") return null;

  if (state.status === "error") {
    return <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{state.message}</p>;
  }

  const copyPassword = async () => {
    if (!state.temporaryPassword) return;
    await navigator.clipboard.writeText(state.temporaryPassword);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div role="status" className="mt-4 border-l-4 border-gold bg-amber-50 px-4 py-4">
      <p className="flex items-center gap-2 text-sm font-black text-amber-950"><CheckCircle2 size={17} /> {state.message}</p>
      <p className="mt-2 truncate text-xs font-bold text-amber-900">{state.email}</p>
      <div className="mt-3 flex items-center gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg bg-ink px-3 py-3 text-sm font-black text-white">{state.temporaryPassword}</code>
        <button type="button" onClick={copyPassword} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold text-ink transition hover:bg-ink hover:text-white" title="Copier le mot de passe" aria-label="Copier le mot de passe">
          {copied ? <Check size={18} /> : <Clipboard size={18} />}
        </button>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-amber-900">Copie-le maintenant: il ne sera plus affiché après avoir quitté ou actualisé cette page.</p>
    </div>
  );
}

function PasswordReset({ member }: { member: OperatorMember }) {
  const [state, action] = useActionState(resetOperatorPasswordAction, initialCredentialActionState);

  return (
    <div className="mt-4 border-t border-ink/8 pt-4">
      <form action={action} onSubmit={(event) => {
        if (!window.confirm(`Générer un nouvel accès temporaire pour ${member.displayName} ?`)) event.preventDefault();
      }}>
        <input type="hidden" name="email" value={member.email} />
        <PendingSubmitButton
          idleLabel={member.passwordConfigured ? "Réinitialiser le mot de passe" : "Initialiser le compte"}
          pendingLabel="Génération..."
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-ink/10 px-3 text-xs font-black transition hover:border-gold hover:bg-gold/10 disabled:opacity-60"
        />
      </form>
      <TemporaryCredential state={state} />
    </div>
  );
}

function memberStatus(member: OperatorMember) {
  if (!member.isActive) return { label: "Désactivé", className: "bg-neutral-100 text-neutral-500" };
  if (!member.passwordConfigured) return { label: "Activation requise", className: "bg-amber-100 text-amber-900" };
  if (member.mustChangePassword) return { label: "Mot de passe temporaire", className: "bg-blue-50 text-blue-700" };
  return { label: "Actif", className: "bg-green-50 text-green-700" };
}

export function OperatorTeamManager({ identity, members, activity, errorMessage, savedState }: Props) {
  const [createState, createAction] = useActionState(createOperatorAction, initialCredentialActionState);
  const messages: Record<string, string> = {
    disabled: "Accès désactivé et anciennes sessions révoquées.",
    reactivated: "Accès du membre réactivé.",
    role: "Rôle modifié et anciennes sessions révoquées.",
  };
  const errors: Record<string, string> = {
    invalid: "Vérifie les informations saisies.",
    self: "Cette action doit être réalisée par un autre administrateur.",
    "primary-admin": "Le compte administrateur principal doit rester actif.",
    forbidden: "Cette action est réservée aux administrateurs.",
  };

  return (
    <div>
      <header>
        <p className="text-xs font-black uppercase text-gold">Accès et sécurité</p>
        <h1 className="mt-1 text-2xl font-black sm:text-3xl">Membres de l’équipe</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600">Crée les comptes, attribue les rôles et retire les accès depuis un seul endroit. Aucune inscription publique n’est possible.</p>
      </header>

      {savedState ? <div role="status" className="mt-5 flex gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800"><CheckCircle2 size={18} /> {messages[savedState] || "Modification enregistrée."}</div> : null}
      {errorMessage ? <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{errors[errorMessage] || "L’action n’a pas pu être terminée."}</div> : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)] xl:items-start">
        <section className="rounded-lg border border-ink/8 bg-white p-5 shadow-sm xl:sticky xl:top-7">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold"><UserPlus size={20} /></span>
            <div><p className="font-black">Créer un compte</p><p className="text-xs text-neutral-500">Réservé aux administrateurs</p></div>
          </div>
          <form action={createAction} className="mt-5 space-y-4">
            <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Nom affiché</span><input name="displayName" required maxLength={100} className={inputClass} placeholder="Ex. Patrick" /></label>
            <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Adresse e-mail</span><input name="email" type="email" required maxLength={160} autoComplete="off" className={inputClass} placeholder="membre@exemple.com" /></label>
            <label className="block"><span className="text-xs font-black uppercase text-neutral-500">Rôle</span><select name="role" defaultValue="operator" className={inputClass}><option value="operator">Opérateur - commandes et suivi</option><option value="admin">Administrateur - accès complet</option></select></label>
            <PendingSubmitButton idleLabel="Créer le compte" pendingLabel="Création..." className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-5 text-sm font-black text-white transition hover:bg-gold hover:text-ink disabled:opacity-60" />
          </form>
          <TemporaryCredential state={createState} />
        </section>

        <section>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="flex items-center gap-2 text-xs font-black uppercase text-gold"><Users size={16} /> Comptes autorisés</p><h2 className="mt-1 text-xl font-black">{members.filter((member) => member.isActive).length} membre(s) actif(s)</h2></div>
            <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-black text-white">{members.filter((member) => !member.passwordConfigured).length} activation(s) requise(s)</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {members.map((member) => {
              const status = memberStatus(member);
              const isCurrentAccount = identity.authMode === "account" && member.email === identity.email;
              const isPrimaryAdmin = member.email === "mrdelivery004@gmail.com";
              return (
                <article key={member.email} className="rounded-lg border border-ink/8 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><p className="truncate font-black">{member.displayName}</p><p className="mt-1 truncate text-xs font-semibold text-neutral-500">{member.email}</p></div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-black ${status.className}`}>{status.label}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-ink/8 pt-3 text-xs">
                    <div><p className="font-bold text-neutral-400">Dernière connexion</p><p className="mt-1 flex items-center gap-1.5 font-black"><Clock3 size={12} /> {formatDate(member.lastLoginAt)}</p></div>
                    <div><p className="font-bold text-neutral-400">Rôle</p><p className="mt-1 flex items-center gap-1.5 font-black"><ShieldCheck size={14} className="text-gold" /> {member.role === "admin" ? "Administrateur" : "Opérateur"}</p></div>
                  </div>

                  {!isCurrentAccount ? (
                    <>
                      <form action={updateOperatorRoleAction} className="mt-4 flex gap-2">
                        <input type="hidden" name="email" value={member.email} />
                        <select name="role" defaultValue={member.role} disabled={isPrimaryAdmin} className="min-h-10 min-w-0 flex-1 rounded-lg border border-ink/10 bg-[#fffdf7] px-3 text-xs font-black disabled:opacity-60"><option value="operator">Opérateur</option><option value="admin">Administrateur</option></select>
                        <button type="submit" disabled={isPrimaryAdmin} className="min-h-10 rounded-lg bg-ink px-3 text-xs font-black text-white transition hover:bg-gold hover:text-ink disabled:cursor-not-allowed disabled:opacity-40">Modifier</button>
                      </form>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <form action={toggleOperatorAction}>
                          <input type="hidden" name="email" value={member.email} />
                          <input type="hidden" name="isActive" value={member.isActive ? "false" : "true"} />
                          <button type="submit" disabled={isPrimaryAdmin} className="min-h-10 w-full rounded-lg border border-ink/10 px-3 text-xs font-black transition hover:border-gold disabled:cursor-not-allowed disabled:opacity-40">{member.isActive ? "Désactiver" : "Réactiver"}</button>
                        </form>
                        <span className="flex min-h-10 items-center justify-center rounded-lg bg-neutral-50 px-2 text-center text-[0.68rem] font-bold text-neutral-500">Sessions révoquées après modification</span>
                      </div>
                      <PasswordReset member={member} />
                    </>
                  ) : (
                    <p className="mt-4 rounded-lg bg-neutral-50 px-3 py-3 text-center text-xs font-black text-neutral-600">Compte actuellement connecté</p>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      </div>

      <section className="mt-7 border-t border-ink/10 pt-6">
        <p className="flex items-center gap-2 text-xs font-black uppercase text-gold"><KeyRound size={15} /> Journal de sécurité</p>
        <h2 className="mt-1 text-xl font-black">Dernières actions de l’équipe</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/8 bg-white">
          {activity.length ? activity.map((item) => <div key={item.id} className="grid gap-1 border-b border-ink/8 px-4 py-3 last:border-0 sm:grid-cols-[1fr_1.4fr_auto] sm:items-center"><p className="truncate text-sm font-black">{item.actorEmail}</p><p className="text-sm text-neutral-600">{item.summary}</p><p className="text-xs font-semibold text-neutral-400">{formatDate(item.createdAt)}</p></div>) : <p className="p-5 text-sm text-neutral-600">Les prochaines modifications apparaîtront ici.</p>}
        </div>
      </section>
    </div>
  );
}

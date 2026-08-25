"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOperatorIdentity } from "@/lib/operator-auth";
import {
  createOperatorMember,
  getOperatorMember,
  logOperatorActivity,
  setOperatorMemberActive,
  setOperatorMemberPassword,
  setOperatorMemberRole,
  type OperatorRole,
} from "@/lib/operator-members";
import { generateTemporaryPassword, hashOperatorPassword } from "@/lib/operator-password";

export type CredentialActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  email?: string;
  temporaryPassword?: string;
};

function readText(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

async function requireAdmin() {
  return requireOperatorIdentity({ adminOnly: true });
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createOperatorAction(
  _state: CredentialActionState,
  formData: FormData,
): Promise<CredentialActionState> {
  const identity = await requireAdmin();
  const email = readText(formData, "email").toLowerCase();
  const displayName = readText(formData, "displayName");
  const role = readText(formData, "role") as OperatorRole;

  if (!validEmail(email) || !displayName || displayName.length > 100 || !["admin", "operator"].includes(role)) {
    return { status: "error", message: "Vérifie le nom, l’adresse e-mail et le rôle." };
  }

  const temporaryPassword = generateTemporaryPassword();
  const member = await createOperatorMember({
    email,
    displayName,
    role,
    passwordHash: hashOperatorPassword(temporaryPassword),
  });

  if (!member) {
    return { status: "error", message: "Ce compte existe déjà. Utilise l’action de réinitialisation." };
  }

  await logOperatorActivity({
    actorEmail: identity.email,
    action: "created",
    entityType: "operator",
    entityId: email,
    summary: `${displayName} ajouté comme ${role === "admin" ? "administrateur" : "opérateur"}`,
  });
  revalidatePath("/operator/team");

  return {
    status: "success",
    message: "Compte créé. Transmets ce mot de passe temporaire au membre.",
    email,
    temporaryPassword,
  };
}

export async function resetOperatorPasswordAction(
  _state: CredentialActionState,
  formData: FormData,
): Promise<CredentialActionState> {
  const identity = await requireAdmin();
  const email = readText(formData, "email").toLowerCase();
  if (!validEmail(email) || email === identity.email) {
    return { status: "error", message: "Utilise un autre compte administrateur pour réinitialiser ton propre accès." };
  }

  const member = await getOperatorMember(email);
  if (!member) return { status: "error", message: "Ce membre est introuvable." };

  const temporaryPassword = generateTemporaryPassword();
  await setOperatorMemberPassword(email, hashOperatorPassword(temporaryPassword), true);
  await logOperatorActivity({
    actorEmail: identity.email,
    action: member.passwordConfigured ? "password_reset" : "password_initialized",
    entityType: "operator",
    entityId: email,
    summary: member.passwordConfigured ? `Accès de ${member.displayName} réinitialisé` : `Accès de ${member.displayName} initialisé`,
  });
  revalidatePath("/operator/team");

  return {
    status: "success",
    message: member.passwordConfigured ? "Nouveau mot de passe temporaire généré." : "Compte activé avec un mot de passe temporaire.",
    email,
    temporaryPassword,
  };
}

export async function updateOperatorRoleAction(formData: FormData) {
  const identity = await requireAdmin();
  const email = readText(formData, "email").toLowerCase();
  const role = readText(formData, "role") as OperatorRole;
  if (!validEmail(email) || !["admin", "operator"].includes(role)) redirect("/operator/team?error=invalid");
  if (email === identity.email) redirect("/operator/team?error=self");
  if (email === "mrdelivery004@gmail.com" && role !== "admin") redirect("/operator/team?error=primary-admin");

  await setOperatorMemberRole(email, role);
  await logOperatorActivity({
    actorEmail: identity.email,
    action: "role_updated",
    entityType: "operator",
    entityId: email,
    summary: `${email} devient ${role === "admin" ? "administrateur" : "opérateur"}`,
  });
  revalidatePath("/operator/team");
  redirect("/operator/team?saved=role");
}

export async function toggleOperatorAction(formData: FormData) {
  const identity = await requireAdmin();
  const email = readText(formData, "email").toLowerCase();
  const isActive = readText(formData, "isActive") === "true";

  if (!validEmail(email) || email === identity.email) redirect("/operator/team?error=self");
  if (email === "mrdelivery004@gmail.com" && !isActive) redirect("/operator/team?error=primary-admin");

  await setOperatorMemberActive(email, isActive);
  await logOperatorActivity({
    actorEmail: identity.email,
    action: isActive ? "reactivated" : "disabled",
    entityType: "operator",
    entityId: email,
    summary: `${email} ${isActive ? "réactivé" : "désactivé"}`,
  });
  revalidatePath("/operator/team");
  redirect(`/operator/team?saved=${isActive ? "reactivated" : "disabled"}`);
}
